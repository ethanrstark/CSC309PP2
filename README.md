# **Scriptorium**

Scriptorium is a platform that combines code writing, execution, and management with community-driven features like blogs, templates, and user interactions. It provides a seamless experience for developers to write, share, and learn collaboratively.

---

## **Features**

### **1. User Accounts**
- User authentication using JSON Web Tokens (JWT).
- Profile management (first name, last name, email, profile picture, phone number).
- Sign-up, login, logout, and edit profile functionality.

---

### **2. Code Writing and Execution**
- **Code Editor**: Write code in multiple programming languages (e.g., C, C++, Java, Python, JavaScript, and more).
- **Syntax Highlighting**: Automatic syntax highlighting based on the selected language.
- **Code Execution**: Run code in real-time with support for input via standard input (stdin).
- **Error Reporting**: Display detailed error messages for compile-time and runtime issues.
- **Security**: Code execution in isolated Docker containers with time and memory limits.

---

### **3. Code Templates**
- Save code as templates with titles, explanations, and tags.
- View, search, edit, and delete templates.
- Fork existing templates with attribution.
- Explore templates by title, tags, and content.

---

### **4. Blog Posts**
- Create, edit, and delete blog posts with links to code templates.
- Browse, read, and search blog posts by title, content, tags, or related code templates.
- Engage with posts through comments, replies, and upvote/downvote ratings.
- View a list of blog posts referencing a specific code template.

---

### **5. Inappropriate Content Reporting**
- Report inappropriate blog posts or comments with additional explanations.
- Admin features to view and manage reported content, including hiding inappropriate posts/comments.

---

### **7. Infrastructure**
- **TypeScript**: Fully type-safe frontend and backend implementation.
- **Docker**: Isolated execution environments for security and scalability.
- **Pre-populated Database**: Comes with 30-40 preloaded templates, blog posts, users, and comments for showcasing functionality.
- **Pagination**: All API endpoints that return lists implement pagination for faster fetching.

---

## **Tech Stack**
- **Frontend**: Next.js, React, TailwindCSS, TypeScript
- **Backend**: Next.js, Node.js, Prisma
- **Database**: SQLite (with sample data)
- **Containerization**: Docker for isolated execution environments
- **Authentication**: JWT-based system for secure user sessions
- **API Testing**: Postman

---

## **Setup and Installation**

### **Prerequisites**
- Node.js (>=16.0.0)
- Docker
- PostgreSQL

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/scriptorium.git
   cd scriptorium
