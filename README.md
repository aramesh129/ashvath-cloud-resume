# Ashvath Ramesh — Cloud Portfolio

> **Live Site:** [dp94ita1pyga6.cloudfront.net](https://dp94ita1pyga6.cloudfront.net)

A fully serverless personal portfolio site built on AWS. This project uses cloud architecture across compute, storage, networking, databases, infrastructure as code, and CI/CD.

---

## Architecture

```
Browser
  └─→ CloudFront (CDN + HTTPS)
        └─→ S3 (Static site hosting)
              └─→ JavaScript fetch() on page load
                    └─→ API Gateway (HTTP API)
                          └─→ Lambda (Python 3.12)
                                └─→ DynamoDB (visitor count)
```

Every infrastructure resource is defined as code in Terraform and deployed automatically via GitHub Actions on every push to `main`.

---

## Tech Stack

| Layer | Service / Tool |
|---|---|
| CDN + HTTPS | CloudFront + ACM |
| Static Hosting | S3 |
| API | API Gateway (HTTP API v2) |
| Compute | Lambda (Python 3.12) |
| Database | DynamoDB (PAY_PER_REQUEST) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Frontend | HTML, CSS, JavaScript, GSAP |

---

## Project Structure

```
ashvath-cloud-resume/
├── frontend/
│   ├── index.html              # Resume site
│   ├── style.css               # Styles
│   └── script.js               # Visitor counter + animations
├── backend/
│   └── lambda_function.py      # Python Lambda — increments DynamoDB counter
├── infrastructure/
│   ├── main.tf                 # All AWS resources defined in Terraform
│   ├── variables.tf            # Input variables
│   └── outputs.tf              # Output values
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
└── README.md
```

---

## How It Works

### Frontend
The site is a static HTML/CSS/JS portfolio hosted in an S3 bucket and served globally through CloudFront with HTTPS via ACM. On every page load, JavaScript makes a `POST` request to the API Gateway endpoint.

### Visitor Counter
The API Gateway triggers a Python Lambda function that runs an atomic `UpdateItem` on a DynamoDB table which increments the visitor count and returns the new value. The count is displayed live in the navigation bar.

### Infrastructure as Code
All AWS resources including S3, CloudFront, Lambda, API Gateway, DynamoDB, and IAM roles are provisioned using Terraform. The entire stack can be recreated from  with a single `terraform apply`.

### CI/CD Pipeline
Every `git push` to `main` triggers two parallel GitHub Actions jobs:
- **Deploy Frontend** — syncs `frontend/` to S3 and invalidates the CloudFront cache
- **Deploy Backend** — zips and deploys the updated Lambda function
