# StockSync – B2B Inventory & Order Management System

StockSync is a full-stack SaaS platform designed for small businesses (electronics stores, bakeries, retail shops) to manage product inventories, coordinate business checkouts, and monitor low-stock restock targets.

---

## Technical Stack

*   **Frontend**: React (Vite) + Tailwind CSS v3 + React Router + Axios + Recharts
*   **Backend**: Node.js + Express (MVC structure) + Sequelize ORM + JWT Session Authorization
*   **Database**: PostgreSQL
*   **Containers**: Docker & Docker Compose
*   **Cloud Hosting**: AWS (S3 + CloudFront + Route53 + ECS Fargate + RDS PostgreSQL + API Gateway + CodePipeline CI/CD)

---

## Folder Structure

```
/ (project root)
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection configs (Sequelize)
│   │   ├── controllers/  # Request controllers (Auth, Product, Order, Dashboard)
│   │   ├── middleware/   # JWT verification & S3 Multer upload
│   │   ├── models/       # Sequelize schema models
│   │   ├── routes/       # Express HTTP endpoint router maps
│   │   └── database/     # DB schema migrations and seed scripts
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared Layout sidebar & route guards
│   │   ├── context/      # Session state provider
│   │   ├── pages/        # Dashboard, Login, products, orders, inventory pages
│   │   ├── services/     # Axios client configuration
│   │   ├── App.jsx       # Routing definitions
│   │   └── index.css     # Global Tailwind stylesheet
│   ├── Dockerfile
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── buildspec.yml         # AWS CodeBuild pipeline build stages
├── docker-compose.yml    # Local multi-container development environment
└── AWS_DEPLOYMENT.md     # Production cloud architecture step-by-step setup
```

---

## Local Development Quickstart

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Setup and Boot
1.  Clone this repository to your computer workspace.
2.  In the project root folder, execute the orchestration script:
    ```bash
    docker-compose up --build
    ```
    This coordinates and boots three service layers:
    *   **PostgreSQL Database** running on port `5432`
    *   **Express API Backend** running on port `5000` (live API: `http://localhost:5000/api`)
    *   **React SPA Frontend** running on port `3000` (live portal: `http://localhost:3000`)

3.  **Run Migrations & Seeds**:
    Open a separate terminal window and execute migrations and seed scripts directly inside the container to populate database schemas and initial product SKU inventories:
    ```bash
    # Run Database Migrations
    docker exec -it stocksync-backend npm run db:migrate

    # Seed User Accounts, Categories, and Products
    docker exec -it stocksync-backend npm run db:seed
    ```

---

## Seed Accounts (For Portal Testing)

Once you execute the database seeds, connect to the portal at `http://localhost:3000` and login using one of the following credentials:

| Role | Username / Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@stocksync.com` | `admin123` | Full Access: SKU CRUD, categories creation, orders, adjustments |
| **Staff** | `staff@stocksync.com` | `staff123` | Restricted: Place orders, change order status, adjust inventory stock |

---

## API Routes Index

### Authentication
*   `POST /api/register` - Create a new user operator profile.
*   `POST /api/login` - Authenticate credentials and retrieve JWT.

### Dashboard Stats
*   `GET /api/dashboard/stats` - Fetch charts telemetry, top KPI cards, recent orders log, and low stock lists.

### Products & Categories
*   `GET /api/products` - List catalog SKUs with search, category, and restock filters.
*   `POST /api/products` - Create new inventory product (Multipart image upload supported, **Admin Only**).
*   `PUT /api/products/:id` - Edit product details/inventory (Multipart image upload, **Admin Only**).
*   `DELETE /api/products/:id` - Remove product from database (**Admin Only**).
*   `GET /api/products/categories` - Fetch active product category list.
*   `POST /api/products/categories` - Create new product category option (**Admin Only**).

### Order Desk
*   `GET /api/orders` - Fetch list of placed orders with customer details.
*   `POST /api/orders` - Place multi-product B2B order (Wrapped inside transaction to safely deduct stock).
*   `PUT /api/orders/:id/status` - Modify order status: Pending, Processing, Completed, Cancelled.

---

## Cloud Deployment
For instructions on deploying the full stack on AWS (S3, CloudFront, ECS Fargate, RDS PostgreSQL, and API Gateway), refer to the detailed [AWS_DEPLOYMENT.md](file:///c:/Users/sahil/Desktop/pep_project/AWS_DEPLOYMENT.md) guide.
