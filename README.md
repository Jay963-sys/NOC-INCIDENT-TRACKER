# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```
NOC FAULT LOGGER 2.0
├─ backend
│  ├─ .sequelizerc
│  ├─ config
│  │  ├─ config.js
│  │  └─ db.js
│  ├─ controllers
│  │  └─ userController.js
│  ├─ hash.js
│  ├─ middleware
│  │  └─ authMiddleware.js
│  ├─ migrations
│  │  ├─ 20250707122452-create-departments....js
│  │  ├─ 20250707122457-create-users.js
│  │  ├─ 20250707122513-create-customers.js
│  │  ├─ 20250707122530-create-faults.js
│  │  ├─ 20250707122542-create-faultnotes.js
│  │  ├─ 20250707140114-remove-assigned-to-from-faults.js
│  │  ├─ 20250707142605-add-resolvedAt-and-closedAt-to-faults.js
│  │  ├─ 20250708094447-add-department-id-to-faultnotes.js
│  │  ├─ 20250708134751-add-resolved-closed-by-to-fault.js
│  │  ├─ 20250708153533-create-faulthistory.js
│  │  ├─ 20250711121933-support-general-faults.js
│  │  └─ 20250717101136-add-is-active-to-users.js
│  ├─ models
│  │  ├─ Customer.js
│  │  ├─ Department.js
│  │  ├─ Fault.js
│  │  ├─ FaultHistory.js
│  │  ├─ FaultNote.js
│  │  ├─ index.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ auth.js
│  │  ├─ customers.js
│  │  ├─ departments.js
│  │  ├─ faultNotes.js
│  │  ├─ faults.js
│  │  └─ users.js
│  ├─ seeders
│  │  ├─ 20250707124548-initial-admin.js
│  │  ├─ 20250707124636-seed-departments.js
│  │  └─ 20250707124706-seed-customers.js
│  ├─ server.js
│  └─ test-bcrypt.js
├─ frontend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ App.test.js
│  │  ├─ components
│  │  │  ├─ CustomRangeModal.jsx
│  │  │  ├─ DashboardMetrics.jsx
│  │  │  ├─ Drawer.css
│  │  │  ├─ FaultCharts.jsx
│  │  │  ├─ FaultDetailsDrawer.css
│  │  │  ├─ FaultDetailsDrawer.jsx
│  │  │  ├─ FaultList.jsx
│  │  │  ├─ formatPendingTime.js
│  │  │  ├─ NewCustomerForm.jsx
│  │  │  ├─ NewFaultForm.jsx
│  │  │  ├─ NewUserForm.jsx
│  │  │  ├─ PrivateRoute.jsx
│  │  │  ├─ ProtectedLayout.jsx
│  │  │  ├─ ResponsiveDashboardLayout.jsx
│  │  │  ├─ SidebarLayout.css
│  │  │  └─ SidebarLayout.jsx
│  │  ├─ index.css
│  │  ├─ index.js
│  │  ├─ logo.svg
│  │  ├─ pages
│  │  │  ├─ Customers.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ DepartmentDashboard.jsx
│  │  │  ├─ DepartmentFaultsPage.jsx
│  │  │  ├─ Departments.jsx
│  │  │  ├─ Faults.jsx
│  │  │  ├─ LoginPage.js
│  │  │  └─ Users.jsx
│  │  ├─ reportWebVitals.js
│  │  ├─ services
│  │  │  ├─ api.js
│  │  │  └─ auth.js
│  │  └─ setupTests.js
│  └─ tailwind.config.js
├─ package-lock.json
├─ package.json
├─ project-structure.txt
└─ README.md

```