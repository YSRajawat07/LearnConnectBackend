# LearnConnectBackend

## Project Overview
LearnConnect is a Django-based backend system for managing online lectures and user interactions. The project uses Django REST Framework for API development and JWT for authentication.

## Project Structure
LearnConnectBackend/
├── lecture_stream/        # Main project directory
│   ├── settings.py       # Project settings
│   ├── urls.py          # Main URL routing
│   └── wsgi.py          # WSGI configuration
├── users/               # User management app
├── lectures/           # Lecture management app
├── manage.py           # Django management script
└── .env               # Environment variables

## Setup and Installation

### 1. Environment Setup
Create a `.env` file in the root directory with the following variables: