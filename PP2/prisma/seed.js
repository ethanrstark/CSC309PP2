import prisma from "../utils/db.js";
import { hashPassword } from "../utils/auth.js";

async function main() {
    // Seed an admin user
    await prisma.user.create({
        data: {
            userName: "starkee",
            password: await hashPassword("ethan123"),
            firstName: "Ethan",
            lastName: "Stark",
            email: "ethan24@gmail.com",
            avatar: "/1.jpg",
            phoneNum: "1234567890",
            role: "ADMIN",
        },
    });

    // Seed some regular users
    await prisma.user.createMany({
        data: [
            {
                userName: "coderjohn",
                password: await hashPassword("john123"),
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@gmail.com",
                avatar: "/2.jpg",
                phoneNum: "2345678901",
            },
            {
                userName: "devsarah",
                password: await hashPassword("sarah123"),
                firstName: "Sarah",
                lastName: "Smith",
                email: "sarah.smith@hotmail.com",
                avatar: "/3.jpg",
            },
            {
                userName: "pythonqueen",
                password: await hashPassword("python123"),
                firstName: "Alice",
                lastName: "Brown",
                email: "alice.brown@gmail.com",
                avatar: "/4.jpg",
            },
            {
                userName: "frontendking",
                password: await hashPassword("frontend123"),
                firstName: "Jake",
                lastName: "Wilson",
                email: "jake.wilson@gmail.com",
                avatar: "/5.jpg",
                phoneNum: "9876543210",
            },
            {
                userName: "reactguru",
                password: await hashPassword("react123"),
                firstName: "Liam",
                lastName: "Taylor",
                email: "liam.taylor@hotmail.com",
                avatar: "/6.png",
            },
            {
                userName: "cssqueen",
                password: await hashPassword("css123"),
                firstName: "Sophia",
                lastName: "Davis",
                email: "sophia.davis@icloud.com",
                avatar: "/7.jpg",
            },
            {
                userName: "javascriptpro",
                password: await hashPassword("js123"),
                firstName: "Emma",
                lastName: "Garcia",
                email: "emma.garcia@gmail.com",
                avatar: "/8.jpg",
                phoneNum: "5678901234",
            },
            {
                userName: "backendwizard",
                password: await hashPassword("backend123"),
                firstName: "Olivia",
                lastName: "Martinez",
                email: "olivia.martinez@icloud.com",
                avatar: "/9.webp",
            },
            {
                userName: "typescriptfan",
                password: await hashPassword("typescript123"),
                firstName: "Ava",
                lastName: "Hernandez",
                email: "ava.hernandez@gmail.com",
                avatar: "/10.png",
            },
            {
                userName: "nodejsninja",
                password: await hashPassword("node123"),
                firstName: "Ella",
                lastName: "Lopez",
                email: "ella.lopez@biz",
            },
            {
                userName: "fullstacker",
                password: await hashPassword("fullstack123"),
                firstName: "Noah",
                lastName: "Gonzalez",
                email: "noah.gonzalez@gmail.com",
            },
            {
                userName: "graphqlguru",
                password: await hashPassword("graphql123"),
                firstName: "Lucas",
                lastName: "Rodriguez",
                email: "lucas.rodriguez@biz",
            },
            {
                userName: "openaispecialist",
                password: await hashPassword("openai123"),
                firstName: "Mia",
                lastName: "Anderson",
                email: "mia.anderson@gmail.com",
            },
            {
                userName: "newbiecoder",
                password: await hashPassword("newbie123"),
                firstName: "Ethan",
                lastName: "Perez",
                email: "ethan.perez@gmail.com",
            },
        ],
    });

    // Seed tags so there is enough to test pagination
    await prisma.tag.createMany({
        data: [
            { name: "Forked" },
            { name: "October" },
            { name: "JavaScript" },
            { name: "Python" },
            { name: "School" },
            { name: "Debugging" },
            { name: "Frontend" },
            { name: "Backend" },
            { name: "React" },
            { name: "Next.js" },
            { name: "Algorithms" },
            { name: "Data Structures" },
            { name: "TypeScript" },
            { name: "Work" },
            { name: "Web" },
            { name: "UI Design" },
            { name: "Personal Project" },
            { name: "Favourite" },
            { name: "API Design" },
            { name: "Testing" },
        ],
    });

    // Seed code regular templates (not forked, no tags)
    await prisma.codeTemplate.createMany({
        data: [
            {
                title: "Hello JavaScript",
                userId: 1,
                explanation: "Basic JS example",
                code: 'console.log("Hello, JavaScript!");',
                file_name: "hello.js",
                language: "JavaScript",
            },
            {
                title: "Python Greeter",
                userId: 2,
                explanation: "Print greeting in Python",
                code: 'print("Hello, Python!")',
                file_name: "greet.py",
                language: "PYTHON",
            },
            {
                title: "C Math Operations",
                userId: 3,
                explanation: "Basic math operations in C",
                code: '#include<stdio.h>\nint main() {\n  int a = 10, b = 20;\n  printf("Sum: %d", a + b);\n  return 0;\n}',
                file_name: "math.c",
                language: "C",
            },
            {
                title: "Dynamic Arrays in C++",
                userId: 4,
                explanation: "Manage dynamic arrays in C++",
                code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> arr = {1, 2, 3};\n  arr.push_back(4);\n  for (int i : arr) std::cout << i << " ";\n}',
                file_name: "dynamic_array.cpp",
                language: "CPP",
            },
            {
                title: "Java Threads",
                userId: 5,
                explanation: "Simple threading in Java",
                code: 'class MyThread extends Thread {\n  public void run() {\n    System.out.println("Thread is running.");\n  }\n}\npublic class Main {\n  public static void main(String[] args) {\n    new MyThread().start();\n  }\n}',
                file_name: "thread.java",
                language: "JAVA",
            },
            {
                title: "Python Data Processing",
                userId: 6,
                explanation: "Process lists with Python",
                code: "data = [1, 2, 3, 4]\nprint([x**2 for x in data])",
                file_name: "process.py",
                language: "PYTHON",
            },
            {
                title: "Web API Request",
                userId: 7,
                explanation: "Fetch API example",
                code: 'fetch("https://api.example.com").then(res => res.json()).then(data => console.log(data));',
                file_name: "api.js",
                language: "JavaScript",
            },
            {
                title: "Factorial in Java",
                userId: 8,
                explanation: "Calculate factorial using recursion",
                code: "class Main {\n  public static int factorial(int n) {\n    return (n == 1) ? 1 : n * factorial(n - 1);\n  }\n  public static void main(String[] args) {\n    System.out.println(factorial(5));\n  }\n}",
                file_name: "factorial.java",
                language: "JAVA",
            },
            {
                title: "Sorting Algorithm",
                userId: 9,
                explanation: "Bubble sort in C",
                code: "#include<stdio.h>\nvoid sort(int arr[], int n) {\n  for (int i = 0; i < n-1; i++)\n    for (int j = 0; j < n-i-1; j++)\n      if (arr[j] > arr[j+1]) {\n        int temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;\n      }\n}\n",
                file_name: "sort.c",
                language: "C",
            },
            {
                title: "Merge Two Arrays",
                userId: 10,
                explanation: "Merge arrays in Python",
                code: "arr1 = [1, 2, 3]\narr2 = [4, 5, 6]\nmerged = arr1 + arr2\nprint(merged)",
                file_name: "merge.py",
                language: "PYTHON",
            },
        ],
    });

    // Seed templates with tags (not forked)
await prisma.codeTemplate.create({
    data: {
      title: "FizzBuzz in Python",
      userId: 1,
      explanation: "Print FizzBuzz for numbers 1 to 100",
      code: 'for i in range(1, 101):\n  if i % 15 == 0:\n    print("FizzBuzz")\n  elif i % 3 == 0:\n    print("Fizz")\n  elif i % 5 == 0:\n    print("Buzz")\n  else:\n    print(i)',
      file_name: "fizzbuzz.py",
      language: "PYTHON",
      tags: { connect: [{ id: 1 }, { id: 15 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "QuickSort in C++",
      userId: 2,
      explanation: "QuickSort algorithm implementation",
      code: "#include <iostream>\nvoid quickSort(int[], int, int);\nint main() { /*...*/ }",
      file_name: "quicksort.cpp",
      language: "CPP",
      tags: { connect: [{ id: 3 }, { id: 7 }, { id: 12 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Factorial in JavaScript",
      userId: 3,
      explanation: "Recursive factorial function",
      code: "function factorial(n) {\n  return n === 0 ? 1 : n * factorial(n - 1);\n}",
      file_name: "factorial.js",
      language: "JavaScript",
      tags: { connect: [{ id: 4 }, { id: 9 }, { id: 16 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "REST API in Python",
      userId: 4,
      explanation: "Basic Flask REST API",
      code: 'from flask import Flask\napp = Flask(__name__)\n@app.route("/")\ndef hello():\n  return "Hello, World!"',
      file_name: "api.py",
      language: "PYTHON",
      tags: { connect: [{ id: 6 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Binary Search Tree in Java",
      userId: 5,
      explanation: "Implementation of BST",
      code: "class Node { int key; Node left, right; }\nclass BST { /*...*/ }",
      file_name: "bst.java",
      language: "JAVA",
      tags: { connect: [{ id: 20 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Simple Calculator in C",
      userId: 6,
      explanation: "Perform basic calculations",
      code: "#include<stdio.h>\nint main() { int a, b; char op; /*...*/ }",
      file_name: "calc.c",
      language: "C",
      tags: { connect: [{ id: 5 }, { id: 13 }, { id: 14 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Prime Number Checker",
      userId: 7,
      explanation: "Check if a number is prime",
      code: "def is_prime(n):\n  if n <= 1: return False\n  for i in range(2, int(n**0.5) + 1):\n    if n % i == 0: return False\n  return True",
      file_name: "prime.py",
      language: "PYTHON",
      tags: { connect: [{ id: 8 }, { id: 12 }, { id: 17 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "CRUD Operations in JavaScript",
      userId: 8,
      explanation: "Basic CRUD functions",
      code: "let db = [];\nfunction create(item) { db.push(item); }\nfunction read() { return db; }\n",
      file_name: "crud.js",
      language: "JavaScript",
      tags: { connect: [{ id: 4 }, { id: 9 }, { id: 16 }, { id: 12 }, { id: 17 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Merge Sort in Java",
      userId: 9,
      explanation: "Efficient sorting algorithm",
      code: "class MergeSort {\n  void merge(int arr[], int l, int m, int r) {\n    /*...*/\n  }\n}",
      file_name: "mergesort.java",
      language: "JAVA",
      tags: { connect: [{ id: 6 }, { id: 10 }, { id: 18 }, { id: 14 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "File Reader in C++",
      userId: 10,
      explanation: "Read content from a file",
      code: '#include <fstream>\nint main() {\n  std::ifstream file("example.txt");\n  /*...*/\n}',
      file_name: "filereader.cpp",
      language: "CPP",
      tags: { connect: [{ id: 5 }, { id: 11 }, { id: 13 }, { id: 9 }, { id: 2 }] },
    },
  });
  
  // Seed forked templates (without tags)
  await prisma.codeTemplate.create({
    data: {
      title: "Hello JavaScript (Forked)",
      userId: 2,
      explanation: "Modified JS example",
      code: `console.log("Hello, World Wide Web!");`,
      file_name: "hello.js",
      language: "JavaScript",
      isFork: true,
      originalId: 1,
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Python Greeter (Forked)",
      userId: 3,
      explanation: "Python greeter with user input",
      code: `name = input("What is your name? ")
      print(f"Hello, {name}!")`,
      file_name: "greet.py",
      language: "PYTHON",
      isFork: true,
      originalId: 2,
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Dynamic Arrays in C++ (Forked)",
      userId: 5,
      explanation: "Extended dynamic array operations",
      code: `#include <iostream>
      #include <vector>
      int main() {
        std::vector<int> arr;
        for (int i = 1; i <= 5; i++) arr.push_back(i * i);
        for (int x : arr) std::cout << x << " ";
      }`,
      file_name: "dynamic_array.cpp",
      language: "CPP",
      isFork: true,
      originalId: 4,
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Sorting Algorithm (Forked)",
      userId: 1,
      explanation: "Bubble sort in Python",
      code: `def bubble_sort(arr):
        n = len(arr)
        for i in range(n):
          for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
              arr[j], arr[j+1] = arr[j+1], arr[j]`,
      file_name: "sort.py",
      language: "PYTHON",
      isFork: true,
      originalId: 9,
    },
  });
  
  // Seed forked templates (with tags)
  await prisma.codeTemplate.create({
    data: {
      title: "Scriptorium (forked)",
      userId: 1,
      explanation: "CSC309 PP1 (forked)",
      code: `console.log("Hello Whole Wide World");`,
      file_name: "index.js",
      language: "JavaScript",
      isFork: true,
      originalId: 1,
      tags: {
        connect: [{ id: 1 }, { id: 4 }, { id: 5 }],
      },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "FizzBuzz in Python (Forked)",
      userId: 3,
      explanation: "Enhanced FizzBuzz with customizable range",
      code: `def fizzbuzz(start, end):
        for i in range(start, end+1):
          if i % 15 == 0:
            print("FizzBuzz")
          elif i % 3 == 0:
            print("Fizz")
          elif i % 5 == 0:
            print("Buzz")
          else:
            print(i)`,
      file_name: "fizzbuzz_forked.py",
      language: "PYTHON",
      isFork: true,
      originalId: 1,
      tags: { connect: [{ id: 11 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "QuickSort in C++ (Forked)",
      userId: 5,
      explanation: "QuickSort with optimized pivot selection",
      code: `#include <iostream>
      void quickSort(int[], int, int);
      int main() { /* Enhanced logic here */ }`,
      file_name: "quicksort_optimized.cpp",
      language: "CPP",
      isFork: true,
      originalId: 2,
      tags: { connect: [{ id: 7 }, { id: 14 }] },
    },
  });

  await prisma.codeTemplate.create({
    data: {
        title: "FizzBuzz in Python (Forked)",
        userId: 3,
        explanation: "Enhanced FizzBuzz with customizable range",
        code: `def fizzbuzz(start, end):
  for i in range(start, end+1):
    if i % 15 == 0:
      print("FizzBuzz")
    elif i % 3 == 0:
      print("Fizz")
    elif i % 5 == 0:
      print("Buzz")
    else:
      print(i)`,
        file_name: "fizzbuzz_forked.py",
        language: "PYTHON",
        isFork: true,
        originalId: 1,
        tags: { connect: [{ id: 11 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "QuickSort in C++ (Forked)",
        userId: 5,
        explanation: "QuickSort with optimized pivot selection",
        code: `#include <iostream>
void quickSort(int[], int, int);
int main() { /* Enhanced logic here */ }`,
        file_name: "quicksort_optimized.cpp",
        language: "CPP",
        isFork: true,
        originalId: 2,
        tags: { connect: [{ id: 2 }, { id: 7 }, { id: 12 }, { id: 10 }, { id: 20 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Factorial in JS (Forked)",
        userId: 4,
        explanation: "Factorial function with memoization",
        code: `const memo = {};
function factorial(n) {
  if (n in memo) return memo[n];
  return memo[n] = n === 0 ? 1 : n * factorial(n - 1);
}`,
        file_name: "factorial_memo.js",
        language: "JavaScript",
        isFork: true,
        originalId: 3,
        tags: { connect: [{ id: 3 }, { id: 8 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "REST API in Python (Forked)",
        userId: 2,
        explanation: "Flask REST API with database integration",
        code: 'from flask import Flask, jsonify\napp = Flask(__name__)\n@app.route("/api/v1/resource")\ndef resource():\n  return jsonify({"key": "value"})',
        file_name: "api_db.py",
        language: "PYTHON",
        isFork: true,
        originalId: 4,
        tags: { connect: [{ id: 4 }, { id: 10 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Binary Search Tree in Java (Forked)",
        userId: 6,
        explanation: "BST with delete functionality",
        code: 'class Node { int key; Node left, right; }\nclass BST {\n  void deleteKey(int key) { /* Delete logic */ }\n}',
        file_name: "bst_with_delete.java",
        language: "JAVA",
        isFork: true,
        originalId: 5,
        tags: { connect: [{ id: 6 }, { id: 11 }, { id: 14 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Matrix Multiplication (Forked)",
        userId: 1,
        explanation: "Matrix multiplication with input validation",
        code: 'import numpy as np\n# Add validation logic here\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\nprint(np.dot(A, B))',
        file_name: "matrix_validate.py",
        language: "PYTHON",
        isFork: true,
        originalId: 11,
        tags: { connect: [{ id: 1 }, { id: 8 }, { id: 15 }, { id: 14 }, { id: 13 }, { id: 19 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Merge Sort in Java (Forked)",
        userId: 3,
        explanation: "MergeSort with iterative approach",
        code: 'class MergeSort {\n  void iterativeMergeSort(int arr[]) {\n    // Implementation here\n  }\n}',
        file_name: "iterative_mergesort.java",
        language: "JAVA",
        isFork: true,
        originalId: 9,
        tags: { connect: [{ id: 2 }, { id: 9 }, { id: 16 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Prime Checker (Forked)",
        userId: 7,
        explanation: "Prime checker optimized for larger numbers",
        code: 'def is_prime(n):\n  if n <= 1: return False\n  if n <= 3: return True\n  if n % 2 == 0 or n % 3 == 0: return False\n  i = 5\n  while i * i <= n:\n    if n % i == 0 or n % (i + 2) == 0:\n      return False\n    i += 6\n  return True',
        file_name: "prime_optimized.py",
        language: "PYTHON",
        isFork: true,
        originalId: 7,
        tags: { connect: [{ id: 7 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "File Reader in C++ (Forked)",
        userId: 5,
        explanation: "Enhanced file reader with error handling",
        code: '#include <fstream>\n#include <iostream>\nint main() {\n  std::ifstream file("example.txt");\n  if (!file) {\n    std::cerr << "Error opening file";\n  }\n}',
        file_name: "filereader_error.cpp",
        language: "CPP",
        isFork: true,
        originalId: 10,
        tags: { connect: [{ id: 6 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "CRUD Operations (Forked)",
        userId: 4,
        explanation: "CRUD with logging",
        code: 'let db = [];\nfunction create(item) { db.push(item); console.log("Created:", item); }\nfunction read() { return db; }',
        file_name: "crud_logging.js",
        language: "JavaScript",
        isFork: true,
        originalId: 8,
        tags: { connect: [{ id: 9 }, { id: 14 }, { id: 18 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Web Scraper in Python (Forked)",
        userId: 2,
        explanation: "Scrape with pagination support",
        code: 'import requests\nfrom bs4 import BeautifulSoup\ndef scrape_pages(urls):\n  for url in urls:\n    resp = requests.get(url)\n    soup = BeautifulSoup(resp.text, "html.parser")\n    print(soup.title)',
        file_name: "scraper_pages.py",
        language: "PYTHON",
        isFork: true,
        originalId: 12,
        tags: { connect: [{ id: 5 }, { id: 11 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Web Scraper in Python 2 (Forked)",
        userId: 14,
        explanation: "Web scraping copy",
        code: 'import requests\nfrom bs4 import BeautifulSoup\ndef scrape_pages(urls):\n  for url in urls:\n    resp = requests.get(url)\n    soup = BeautifulSoup(resp.text, "html.parser")\n    print(soup.title)',
        file_name: "scraper.py",
        language: "PYTHON",
        isFork: true,
        originalId: 12,
        tags: { connect: [{ id: 4 }, { id: 12 }, { id: 19 }, { id: 10 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Startup Code (Forked)",
        userId: 1,
        explanation: "Enhanced AI startup with parallel processing",
        code: '#include <pthread.h>\nint main() {\n  // Threaded logic\n}',
        file_name: "ai_threads.c",
        language: "C",
        isFork: true,
        originalId: 2,
        tags: { connect: [{ id: 8 }, { id: 14 }, { id: 17 }, { id: 7 }] },
    },
});

    // Seed blog posts
    await prisma.blogPost.create({
        data: {
            title: "Understanding Web Scraping with Python",
            description: "An in-depth guide to web scraping techniques using Python and BeautifulSoup.",
            authorId: 1,
            isHidden: false,
            tags: { connect: [{ id: 5 }, { id: 11 }, { id: 15 }] },
            templates: { connect: [{ id: 40 }, { id: 19 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "A Beginner's Guide to REST APIs",
            description: "Explaining the basics of REST APIs and how to set up your own using Python's Flask.",
            authorId: 2,
            isHidden: false,
            tags: { connect: [{ id: 4 }, { id: 7 }, { id: 10 }] },
            templates: { connect: [{ id: 39 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Intro to Machine Learning with Scikit-learn",
            description: "A practical guide to getting started with machine learning using Python's scikit-learn library.",
            authorId: 3,
            isHidden: false,
            tags: { connect: [{ id: 2 }, { id: 13 }, { id: 17 }] },
            templates: { connect: [{ id: 8 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Exploring Asynchronous Programming in Node.js",
            description: "An overview of asynchronous programming in Node.js and how to handle asynchronous operations effectively.",
            authorId: 4,
            isHidden: false,
            tags: { connect: [{ id: 3 }, { id: 9 }] },
            templates: { connect: [{ id: 7 }, { id: 16 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Building a CRUD Application in Java",
            description: "Learn how to build a simple CRUD application using Java and a relational database.",
            authorId: 5,
            isHidden: false,
            tags: { connect: [{ id: 1 }, { id: 6 }] },
            templates: { connect: [{ id: 20 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Mastering Git: A Comprehensive Guide",
            description: "A thorough guide to mastering Git, covering everything from basic commands to advanced workflows.",
            authorId: 6,
            isHidden: false,
            tags: { connect: [{ id: 14 }, { id: 18 }] },
            templates: { connect: [{ id: 40 }, { id: 33 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Getting Started with Docker and Containers",
            description: "An introduction to Docker and how to containerize your applications for easier deployment.",
            authorId: 7,
            isHidden: false,
            tags: { connect: [{ id: 8 }, { id: 16 }, { id: 12 }] },
            templates: { connect: [{ id: 32 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Understanding Data Structures: Arrays vs. Linked Lists",
            description: "A detailed comparison between arrays and linked lists, highlighting their differences and use cases.",
            authorId: 8,
            isHidden: false,
            tags: { connect: [{ id: 2 }, { id: 5 }] },
            templates: { connect: [{ id: 31 }, { id: 17 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Exploring Functional Programming in JavaScript",
            description: "A beginner's guide to functional programming concepts and techniques in JavaScript.",
            authorId: 9,
            isHidden: false,
            tags: { connect: [{ id: 10 }, { id: 3 }, { id: 7 }] },
            templates: { connect: [{ id: 4 }, { id: 18 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Advanced Topics in SQL: Optimizing Queries",
            description: "Learn advanced SQL query optimization techniques to make your database queries more efficient.",
            authorId: 10,
            isHidden: false,
            tags: { connect: [{ id: 9 }, { id: 14 }] },
            templates: { connect: [{ id: 11 }] }
        }
    });

    await prisma.blogPost.create({
        data: {
            title: "Deep Dive into Cloud Computing: Concepts and Benefits",
            description: "An in-depth exploration of cloud computing, covering its key concepts, benefits, and use cases.",
            authorId: 11,
            isHidden: false,
            tags: { connect: [{ id: 5 }, { id: 7 }, { id: 8 }, { id: 14 }, { id: 16 }] },
            templates: { connect: [{ id: 2 }, { id: 5 }, { id: 23 }, { id: 24 }, { id: 25 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Mastering Data Visualization with Python's Matplotlib",
            description: "A comprehensive guide on creating stunning data visualizations using Matplotlib in Python.",
            authorId: 12,
            isHidden: false,
            tags: { connect: [{ id: 2 }, { id: 3 }, { id: 6 }, { id: 10 }] },
            templates: { connect: [{ id: 4 }, { id: 7 }, { id: 26 }, { id: 18 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Advanced Algorithms in Java: A Practical Approach",
            description: "Learn advanced algorithms and how to implement them in Java for solving complex problems.",
            authorId: 13,
            isHidden: false,
            tags: { connect: [{ id: 4 }, { id: 6 }, { id: 9 }, { id: 11 }, { id: 13 }, { id: 14 }, { id: 18 }] },
            templates: { connect: [{ id: 1 }, { id: 9 }, { id: 27 }, { id: 20 }, { id: 29 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Building Real-Time Applications with Node.js and WebSockets",
            description: "Learn how to build real-time applications using Node.js and WebSockets for instant communication.",
            authorId: 14,
            isHidden: false,
            tags: { connect: [{ id: 5 }, { id: 8 }, { id: 10 }, { id: 11 }, { id: 16 }, { id: 19 }] },
            templates: { connect: [{ id: 6 }, { id: 33 }, { id: 19 }, { id: 37 }, { id: 14 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Introduction to DevOps: Automating Your Development Pipeline",
            description: "An introduction to DevOps, focusing on how to automate your development pipeline using various tools and technologies.",
            authorId: 15,
            isHidden: false,
            tags: { connect: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 12 }, { id: 18 }, { id: 20 }] },
            templates: { connect: [{ id: 5 }, { id: 8 }, { id: 38 }, { id: 18 }, { id: 11 }] }
        }
    });

    await prisma.blogPost.create({
        data: {
            title: "Exploring Machine Learning Algorithms",
            description: "A detailed guide on various machine learning algorithms and their applications.",
            authorId: 2,
            isHidden: false,
            tags: { connect: [{ id: 1 }] },
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Getting Started with Web Development Using HTML & CSS",
            description: "An introductory guide for beginners to web development with HTML and CSS.",
            authorId: 6,
            isHidden: false,
            templates: { connect: [{ id: 4 }, { id: 8 }, { id: 40 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Building REST APIs with Node.js and Express",
            description: "Learn how to build scalable REST APIs using Node.js and Express.",
            authorId: 4,
            isHidden: false,
            tags: { connect: [{ id: 5 }, { id: 9 }] },
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Advanced SQL Queries: Optimization and Best Practices",
            description: "A deep dive into SQL query optimization techniques and best practices.",
            authorId: 9,
            isHidden: false,
            templates: { connect: [{ id: 3 }, { id: 35 }, { id: 25 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Getting Started with Cloud Computing and AWS",
            description: "An introductory guide to cloud computing with a focus on Amazon Web Services (AWS).",
            authorId: 10,
            isHidden: false,
            tags: { connect: [{ id: 2 }, { id: 6 }, { id: 10 }] },
        }
    });

    await prisma.blogPost.create({
        data: {
            title: "Exploring Experimental AI Techniques",
            description: "A research-oriented blog discussing cutting-edge AI techniques with no practical use yet.",
            authorId: 1,
            isHidden: true,
            hiddenReason: "In-progress research, not yet suitable for public view",
            tags: { connect: [{ id: 3 }, { id: 5 }, { id: 13 }] },
            templates: { connect: [{ id: 22 }, { id: 24 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Unfinished Guide to Quantum Computing",
            description: "A half-written guide on quantum computing that requires further refinement.",
            authorId: 3,
            isHidden: true,
            hiddenReason: "Work in progress, lacks clarity and detail",
            tags: { connect: [{ id: 17 }] },
            templates: { connect: [{ id: 26 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Incomplete Framework for Node.js Authentication",
            description: "Partially developed Node.js authentication framework, lacking security features.",
            authorId: 5,
            isHidden: true,
            hiddenReason: "Framework lacks critical functionality and needs testing",
            tags: { connect: [{ id: 8 }, { id: 9 }, { id: 15 }] },
            templates: { connect: [{ id: 36 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Prototypes of Web Scraping in Python",
            description: "Prototypes for a web scraping tool, without full functionality or error handling.",
            authorId: 7,
            isHidden: true,
            hiddenReason: "Prototype stage, missing core functionality",
            tags: { connect: [{ id: 7 }] },
            templates: { connect: [{ id: 28 }, { id: 31 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Early Concepts of Blockchain Technology",
            description: "Conceptual discussions around blockchain, but without implementation examples.",
            authorId: 2,
            isHidden: true,
            hiddenReason: "Lacks implementation and practical examples",
            tags: { connect: [{ id: 2 }, { id: 6 }, { id: 12 }] },
            templates: { connect: [{ id: 33 }, { id: 36 }, { id: 2 }, { id: 6 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Prototype for React Component Architecture",
            description: "Early prototype of a React component architecture, lacking full details.",
            authorId: 4,
            isHidden: true,
            hiddenReason: "Needs better organization and documentation",
            tags: { connect: [{ id: 4 }, { id: 8 }, { id: 14 }, { id: 2 }] },
            templates: { connect: [{ id: 23 }, { id: 35 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Intro to Advanced Networking Concepts",
            description: "A brief introduction to advanced networking topics with missing explanations.",
            authorId: 8,
            isHidden: true,
            hiddenReason: "Insufficient explanations, needs revision",
            tags: { connect: [{ id: 9 }, { id: 11 }, { id: 16 }] },
            templates: { connect: [{ id: 21 }, { id: 29 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Incomplete Guide to Python Data Structures",
            description: "Incomplete Python data structure guide without code examples.",
            authorId: 6,
            isHidden: true,
            hiddenReason: "Missing critical code examples, under development",
            tags: { connect: [{ id: 5 }, { id: 3 }, { id: 15 }, { id: 13 }, { id: 1 }, { id: 19 }] },
            templates: { connect: [{ id: 32 }, { id: 34 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Experimental Version of a Deep Learning Model",
            description: "Experimental deep learning model without proper validation.",
            authorId: 9,
            isHidden: true,
            hiddenReason: "Unvalidated results, requires further testing",
            tags: { connect: [{ id: 20 }, { id: 13 }] },
            templates: { connect: [{ id: 25 }, { id: 38 }, { id: 18 }] }
        }
    });
    
    await prisma.blogPost.create({
        data: {
            title: "Mockup for Game Development Framework",
            description: "Early mockup of a game development framework with minimal functionality.",
            authorId: 10,
            isHidden: true,
            hiddenReason: "Incomplete and lacks core features",
            tags: { connect: [{ id: 1 }, { id: 8 }, { id: 18 }] },
            templates: { connect: [{ id: 19 }, { id: 40 }] }
        }
    });

    // TODO finish seeding comments and reports and ratings

    // Seed 2 comments and connect it to a user and blog post
    await prisma.comment.createMany({
        data: [
            {
                content: "I agree",
                authorId: 1,
                postId: 1,
            },
            {
                content: "Me too",
                authorId: 2,
                postId: 1,
            },
        ],
    });

    // Seed a few replies to the first comment
    await prisma.comment.createMany({
        data: [
            {
                content: "edit: nvm",
                authorId: 1,
                parentId: 1,
                postId: 1,
            },
            {
                content: "You gots to be right",
                authorId: 2,
                parentId: 1,
                postId: 1,
            },
        ],
    });

    //now reports
    await prisma.report.createMany({
        data: [
            {
                //set 1 report for comment 1
                reason: "Innapropriate content",
                commentId: 1,
                userId: 1,
            },
            {
                //set 2 reports for post 1
                reason: "Harmful content",
                postId: 1,
                userId: 1,
            },
            {
                reason: "Harmful content",
                postId: 1,
                userId: 2,
            },
            //set 2 reports for comment 2
            {
                reason: "Innapropriate content",
                commentId: 2,
                userId: 1,
            },
            {
                reason: "Innapropriate content",
                commentId: 2,
                userId: 2,
            },
            //set 1 report for post 2
            {
                reason: "Harmful content",
                postId: 2,
                userId: 1,
            },
        ],
    });

    console.log("Database has been seeded successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
