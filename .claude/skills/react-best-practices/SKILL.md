---
name: React Best Practices
description: Production-grade React guidelines including folder structure, API routing, and theming.
---

# Production-Grade React Application: Best Practices Guide

This document outlines the standard conventions and best practices to follow while developing features, based strictly on the established architectural patterns in the codebase.

## 📁 1. Folder Structure

The application's `src` directory is organized into several key modules. Here is the visual structure and its purpose:

```text
src/
├── assets/             # Static assets like images and SVG icons
├── components/         # Shared global UI components and modernized reusable elements
├── config/             # Application-wide configurations and constants (e.g., constants.ts, axios.config.ts)
├── containers/         # Higher-order components or layout wrappers
├── contexts/           # React Context providers (e.g., AuthContext)
├── crud/               # API service calls. Contains custom axios instance and *.crud.js files
├── pages/              # Standard application pages and modernized page views
├── reusable/           # Small, highly reusable UI elements (e.g., Icons, simple generic wrappers)
├── routes/             # Routing logic, separating authenticated, unauthenticated, and dashboard routes
├── services/           # Utility services and external API integrations
├── themes/             # Theming and styling constants (e.g., colors, breakpoints)
├── types/              # TypeScript definitions and interfaces
└── Utils/              # Helper functions and utilities (e.g., helpers.js, FormManager)
```

**Best Practices for Structure:**
*   Always place feature-specific pages inside `pages/`.
*   Put reusable atoms and molecules inside `components/` or `reusable/`.
*   Keep all API network requests inside `crud/` as separate `.crud.js` files.

## 🧱 2. Constants and Configs

### Constants
Centralize constants to avoid "magic strings/numbers" scattered across the codebase. Define application-wide constants in `src/Utils/constants.js` (or similar files). Group related constants using objects to keep them organized.

```javascript
// Example: src/Utils/constants.js

export const CHECKIN_MODES = {
    MANUAL: 2,
    SILENT: 1
};

export const REGISTRATION_STATUS = {
    ACTIVE: 2,
    CANCEL: 3,
    WAITLIST: 6,
    APPROVAL_PENDING: 10
};

export const DAYS_ARR = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" }
];
```

### Configuration
Environment variables and URLs should be managed centrally in a configuration file like `src/config/config.ts`. Always provide a fallback value so the application doesn't crash if an environment variable is missing in a lower environment.

```typescript
// Example: src/config/config.ts
/**
 * Configuration file for the application.
 * Uses environment variables with fallbacks to static values.
 */

export const currentEnv: string = process.env.VITE_ENVIRONMENT || "dev";
export const baseUrl: string = process.env.VITE_BASE_URL || "https://dev.example.com";
export const websiteUrl: string = process.env.VITE_WEBSITE_URL || "https://dev-website.example.com";
export const loginUrl: string = process.env.VITE_LOGIN_URL || "https://dev-accounts.example.com";
export const mediaUrl: string = process.env.VITE_MEDIA_URL || "https://dev-media.example.com";
export const externalServiceKey: string = 
    process.env.VITE_EXTERNAL_SERVICE_API_KEY || "AIzaSyCf49QgFX7U2vn0twqVZFqApKuCZfAApCQ";
```

Never hardcode these URLs or API keys directly into your components. Always import them from `src/config/config.ts`.

## 🔌 3. Writing and Using CRUD APIs

All network requests must be routed through the custom Axios instance located at `src/crud/axios.js`. This custom instance automatically handles:
*   Attaching the Authorization header (`Bearer token`) via the authentication provider.
*   Centralized error handling and logging (e.g., Sentry).

### Structuring CRUD Functions
Create or update a `.crud.js` file inside `src/crud/`. Follow these patterns for clean URL construction and dynamic query parameters:

```javascript
// Example: src/crud/projectDetails.crud.js
import axios from "./axios";

// 1. Define base paths centrally
const API_URL = axios.defaults.baseURL;
const BASE_URL = "/project/";

// 2. Use helper functions for dynamic route segments
const TASKS_URL = projectId => `${projectId}/tasks`;
const ANALYTICS_URL = projectId => `${projectId}/analytics`;

// Example: Standard GET request using the helper functions
export const getTasks = (projectId, status = "all") => {
    const query = `?status=${status}`;
    return axios.get(API_URL + BASE_URL + TASKS_URL(projectId) + query);
};

// Example: Standard POST request
export const addTask = (projectId, payload) => {
    return axios.post(API_URL + BASE_URL + TASKS_URL(projectId), payload);
};

// Example: Advanced GET request building dynamic query strings safely
export const getAnalytics = (payload, projectId) => {
    const params = new URLSearchParams();

    // Dynamically append only valid payload values
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
        }
    });

    const queryString = params.toString();
    const url = `${API_URL + BASE_URL + ANALYTICS_URL(projectId)}${queryString ? `?${queryString}` : ""}`;

    return axios.get(url);
};
```

### How to use it in a Component
```javascript
// Example: src/pages/FeatureDashboard/FeatureComponent.js
import { useEffect, useState } from "react";
import { getFeatureData } from "../../crud/featureName.crud";

const FeatureComponent = ({ projectId }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getFeatureData(projectId);
                setData(response.data);
            } catch (error) {
                // The interceptor already handles generic logging, but you can add local UI feedback here
                console.error("Failed to load data", error);
            }
        };
        fetchData();
    }, [projectId]);

    return (
        <div>{data ? data.name : 'Loading...'}</div>
    );
};
```

## 🧩 4. Components and Reusable Components

*   **Functional Components**: Always write functional components using React Hooks (`useState`, `useEffect`, etc.). Avoid Class components.
*   **Reusability**: If a component is used in more than one place, move it to `src/components/` or `src/reusable/`. 

## 🎨 5. Theming and Styling

Centralize your design system (colors, fonts, breakpoints) in `src/themes/Theme.js` to ensure consistency and easily support multiple modes (like light/dark mode). Avoid inline styles unless absolutely necessary; instead, reference your theme file.

### Defining Themes

```javascript
// Example: src/themes/Theme.js
export const theme = "light"; // Current active theme

export const baseColors = {
    light: {
        primary: "#572148",
        secondary: "#FFFFFF",
        text: "#212529",
        background: "#F4F7FD",
        error: "#DC3545"
    },
    dark: {
        primary: "#572148",
        secondary: "#000000",
        text: "#F4F7FD",
        background: "#212529",
        error: "#DC3545"
    }
};

// Extend base themes for specific parts of the app (e.g., Dashboard vs Website)
export const dashboardColors = {
    light: {
        ...baseColors.light,
        primary: "#002E6E", // Override for dashboard
        bannerBackground: "#F37018",
    },
    dark: {
        ...baseColors.dark,
        primary: "#572148",
        bannerBackground: "#212529",
    }
};

export const fonts = {
    light: { primary: "Hind", headings: "Montserrat" },
    dark: { primary: "Hind", headings: "Montserrat" }
};
```

### Using Themes in Components

```javascript
import React from "react";
import { theme, dashboardColors } from "../../themes/Theme";

const ThemedButton = ({ children }) => {
    return (
        <button
            style={{
                backgroundColor: dashboardColors[theme].primary,
                color: dashboardColors[theme].secondary,
                border: "none",
                padding: "10px 20px"
            }}
        >
            {children}
        </button>
    );
};

export default ThemedButton;
```

## 🛣️ 6. Routes and Protected Routes

Routing is handled by `react-router-dom` in the `src/routes/` directory. The application splits routing into logical chunks (e.g., `AuthenticatedRoutes.js`, `UnauthenticatedRoutes.js`).

*   **`AuthenticatedRoutes.js`**: Use this for routes that require the user to be logged in. It wraps routes inside the `AuthContext` to ensure unauthenticated users are redirected or blocked.
*   **Lazy Loading**: Use `React.lazy` and `Suspense` for loading major page components to improve performance.

```javascript
// Example of adding a protected route in src/routes/AuthenticatedRoutes.js
import React, { Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy load the component
const NewFeaturePage = React.lazy(() => import("../pages/NewFeature"));

export default function Routes(props) {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Switch>
                {/* ... existing routes ... */}
                
                {/* Standard Protected Route */}
                <Route path="/new-feature/:projectId">
                    <NewFeaturePage {...props} />
                </Route>
            </Switch>
        </Suspense>
    );
}
```

## ✅ 7. Form Validation using Formik & Yup

For complex forms, standard practice is to separate your validation logic into a dedicated `Validations.js` file. You can use custom validation logic returning an `errors` object (useful for complex inter-dependent fields) or a **Yup** schema.

### 1. The Validation File (`Validations.js`)

Keep your validation rules, error messages, and schema definitions isolated from your UI components.

```javascript
// Example: src/pages/CreateFeature/Validations.js
import * as yup from "yup";

const ERROR_MESSAGES = {
    required: "This field is required",
    tooShort: "Must be at least 3 characters long",
    invalidEmail: "Invalid email address format"
};

// Option A: Custom Validation Function (useful for complex logic across multiple fields)
export const featureValidate = async (values, isAdvancedMode) => {
    const errors = {};
    
    if (!values.featureName || values.featureName.trim() === "") {
        errors.featureName = ERROR_MESSAGES.required;
    } else if (values.featureName.length < 3) {
        errors.featureName = ERROR_MESSAGES.tooShort;
    }

    if (isAdvancedMode && !values.advancedSetting) {
        errors.advancedSetting = "Advanced setting is required in advanced mode";
    }

    return errors;
};

// Option B: Yup Validation Schema (standard approach)
export const validationSchema = yup.object({
    featureName: yup
        .string()
        .required(ERROR_MESSAGES.required)
        .min(3, ERROR_MESSAGES.tooShort),
    email: yup
        .string()
        .email(ERROR_MESSAGES.invalidEmail)
        .required(ERROR_MESSAGES.required),
});
```

### 2. The Form Component (`CreateFeature.js`)

Import your validation logic into your main component and hook it into `useFormik`.

```javascript
// Example: src/pages/CreateFeature/CreateFeature.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { featureValidate } from './Validations';

const CreateFeature = () => {
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    // Wrapper function to pass external state to our custom validator
    const validate = async (values) => {
        let errors = await featureValidate(values, isAdvancedMode);
        return errors;
    };

    const formik = useFormik({
        initialValues: {
            featureName: '',
            advancedSetting: ''
        },
        // Use `validate` for custom functions, OR `validationSchema` for Yup
        validate: validate, 
        validateOnMount: true,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                // await createFeatureAPI(values);
                console.log('Form Submitted', values);
                resetForm();
            } catch (error) {
                console.error("Submission error", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="form-group">
                <label htmlFor="featureName">Feature Name</label>
                <input
                    id="featureName"
                    name="featureName"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.featureName}
                />
                {formik.touched.featureName && formik.errors.featureName ? (
                    <div className="error">{formik.errors.featureName}</div>
                ) : null}
            </div>
            
            <button type="submit" disabled={formik.isSubmitting}>
                Submit
            </button>
        </form>
    );
};

export default CreateFeature;
```

> [!TIP]
> Always use `formik.touched` in conjunction with `formik.errors` so that validation errors are only shown *after* the user has interacted with the field. Set `validateOnMount: true` if you need to calculate initial validity (e.g. to disable the submit button initially).

## 🛠️ 8. Utilities and Helpers

Abstract complex or repetitive logic (e.g., date formatting, data transformations, sanitization) into pure functions and place them in the `src/Utils/` directory (e.g., `helpers.js`). 

*   **Pure Functions:** Helpers should generally take inputs and return outputs without modifying external state.
*   **Centralized Logic:** Instead of writing the same date formatting code in three different components, write it once in `helpers.js`.

### Implementation Example

```javascript
// Example: src/Utils/helpers.js
import moment from "moment-timezone";
import DOMPurify from "dompurify";

/**
 * Consistently format date and time into the specified timezone.
 * @param {string | number | Date} localDateTime
 * @param {string} timeZone
 * @returns {moment.Moment}
 */
export const getMomentInTimeZone = (localDateTime, timeZone) => {
    return moment.tz(localDateTime, timeZone);
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Safely sanitizes HTML strings to prevent XSS attacks.
 * @param {string} htmlString
 * @returns {string}
 */
export const sanitizeHtml = (htmlString) => {
    return DOMPurify.sanitize(htmlString, { ALLOWED_TAGS: [] }).trim();
};
```

## ⏳ 9. UI/UX Loading States

When performing network requests or async operations, always provide clear feedback to the user:

*   **Button Loaders & Disabling**: Wherever there is a button triggering an API call (e.g., form submissions, data updates), always show a loader/spinner inside the button and keep the button `disabled` to prevent duplicate submissions.
*   **Skeleton & Shimmer Effects**: When a page or component is initially loading data from an API, use skeleton loaders or shimmer effects instead of generic spinners to simulate the layout of the incoming data, providing a smoother perceived performance.
