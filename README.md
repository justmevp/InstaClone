# InstaClone

A full-featured Instagram/Facebook clone built with Spring Boot and React, featuring modern social media functionalities.

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - Secure password handling
  - Email verification
  - Password reset functionality

- **User Profile Management**
  - Profile picture upload
  - Bio and personal information
  - Account settings
  - Profile visibility controls

- **Social Features**
  - Follow/Unfollow users
  - User search functionality
  - Activity feed
  - User suggestions

- **Post Management**
  - Photo upload and sharing
  - Post editing and deletion
  - Caption and location tagging
  - Multiple photo formats support

- **Interaction Features**
  - Like/Unlike posts
  - Comment on posts
  - Save/Bookmark posts
  - Share posts

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot 3.0.1
- Spring Security with JWT
- Spring Data JPA
- MySQL Database
- Maven
- Swagger UI for API Documentation

### Frontend
- React.js
- Material-UI
- Redux for state management
- Axios for API calls
- SCSS for styling

## 📋 Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- Node.js and npm (for frontend)

## 🔧 Installation & Setup

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/justmevp/InstaClone.git
cd InstaClone
```

2. Configure MySQL Database
- Create a new database
- Update application.properties with your database credentials

3. Create `src/main/resources/secret.properties` with:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your_jwt_secret
jwt.expiration=86400000
```

4. Build and run the backend
```bash
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

## 📚 API Documentation

- Access Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Base URL: `http://localhost:8080/api/v1`

Key API Endpoints:
- Authentication: `/api/v1/auth/**`
- Users: `/api/v1/users/**`
- Posts: `/api/v1/posts/**`
- Comments: `/api/v1/comments/**`
- Followers: `/api/v1/followers/**`

## 🔒 Security

- JWT-based authentication
- Password encryption
- CORS configuration
- Input validation
- XSS protection
- File upload restrictions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- GitHub: [@justmevp](https://github.com/justmevp)

