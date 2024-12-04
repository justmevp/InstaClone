# InstaClone

A Spring Boot-based Instagram clone application with basic features like user authentication, posting, following, and commenting.

## Features

- User Authentication (JWT)
- User Profile Management
- Post Creation and Management
- Following System
- Comment System
- Photo Upload
- User Search

## Tech Stack

- Java 17
- Spring Boot 3.0.1
- Spring Security with JWT
- MySQL Database
- Maven
- Swagger UI for API Documentation

## Getting Started

### Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/InstaClone.git
```

2. Create application.properties file in src/main/resources with following content:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. Build the project
```bash
mvn clean install
```

4. Run the application
```bash
mvn spring-boot:run
```

The application will start on http://localhost:8080

## API Documentation

Access Swagger UI at: http://localhost:8080/swagger-ui.html

## Contributing

This project is still under development. Feel free to contribute by creating issues or submitting pull requests.
