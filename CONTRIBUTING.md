# Contributing to Opti-Oil

First off, thank you for considering contributing to Opti-Oil! It's people like you that make this project better.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any examples of how this enhancement is used in other applications**

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear, descriptive commit messages
- Include comments in your code where necessary
- Update documentation if needed
- Add tests if applicable
- Make sure all tests pass
- Keep pull requests focused on a single feature or fix

## Development Setup

### Prerequisites

- Node.js v18+
- MongoDB v5.0+
- Git

### Setup Steps

1. Clone your fork:
```bash
git clone https://github.com/your-username/opti-oil.git
cd opti-oil
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your values
```

4. Start development servers:
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions
- Follow React best practices

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use template literals for string interpolation
- Use arrow functions where appropriate
- Keep lines under 100 characters when possible

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Examples:
```
Add user authentication feature

- Implement JWT token generation
- Add login and register endpoints
- Create auth middleware

Fixes #123
```

## Project Structure

```
opti-oil/
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── pages/      # Page components
        ├── services/   # API services
        └── utils/      # Utility functions
```

## Testing

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Test React components with React Testing Library
- Aim for high test coverage

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments to functions
- Update API documentation for new endpoints
- Include inline comments for complex logic

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🎉
