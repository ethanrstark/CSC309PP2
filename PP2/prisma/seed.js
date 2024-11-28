import prisma from "../utils/db.js";
import { hashPassword } from "../utils/auth.js";

const commentContents = [
    "This is a solid start, but have you considered adding more examples?",
    "Great post, though I feel the conclusion could be expanded.",
    "This was an eye-opener! Keep up the fantastic work.",
    "Reading this was like a mini workout for my brain!",
    "Some points are a bit unclear—could you clarify section X?",
    "Do you have any data sources or references to share?",
    "I liked this, but there’s room for improvement in the formatting.",
    "Have you considered the opposite argument? It might add depth.",
    "How does this apply in real-world scenarios?",
    "Can you elaborate on how this fits into the bigger picture?",
    "My experience was slightly different—here’s what I noticed...",
    "Brilliantly written! I’m looking forward to more posts like this.",
    "You explained this complex topic so clearly. Kudos!",
    "I’ve shared this with my team—it’s that good!",
    "I appreciate the level of detail you’ve provided here.",
    "This should come with a ‘mind blown’ warning!",
    "I struggled with this concept before, but this post helped a lot.",
    "I used to think differently, but this changed my perspective.",
    "Interesting perspective, but I have to disagree with point X.",
    "I think there’s more to consider regarding [specific topic].",
    "Do you have any plans to expand on this in future articles?",
    "This post made my brain do a happy dance—thanks for that!",
    "Thank you for taking the time to write this. Much appreciated!",
    "This helped me more than I can express—thank you!",
    "A big thanks for shedding light on this overlooked topic.",
    "I’ve encountered similar challenges, and this was really helpful.",
    "I recently implemented something like this, and it worked well!",
    "Can you recommend further reading on this subject?",
    "I’d love to see a follow-up post that dives deeper into this.",
    "Could you explain how this approach differs from [another method]?",
    "What inspired you to write about this topic?",
    "This seems a bit one-sided. How about [alternative viewpoint]?",
    "What about the downsides of this approach?",
    "I see your point, but here’s why I think otherwise.",
    "I’ve read this three times, and my brain finally clicked. Worth it!",
    "If this was a class, I’d totally ace it now!",
    "I think a case study would complement this nicely.",
    "Have you thought about making a video version of this?",
    "I can’t thank you enough for sharing your expertise.",
    "You’ve saved me hours of research. Thanks!",
  ];

  const hiddenReasons = [
    "Contains inappropriate language",
    "Violates community guidelines",
    "Spam or promotional content",
    "Offensive or discriminatory remarks",
    "Irrelevant to the discussion",
    "Reported for harassment or bullying",
    "Misinformation or false claims",
    "Copyright infringement",
    "Privacy violation (personal information)",
    "Repeated content from another post",
    "Too many downvotes from users",
    "Explicit or graphic content",
    "Impersonation or misleading identity",
    "Hate speech or inciting violence",
    "Scam or phishing attempt"
  ];

  const reasons = [
    "Offensive content",
    "Spam or promotional content",
    "Misinformation or false claims",
    "Inappropriate language",
    "Irrelevant or off-topic content",
    "Copyright infringement",
    "Harassment or hate speech",
    "Violent or graphic content",
    "Personal information exposure",
    "Misleading or clickbait title",
  ];
  
async function seedComments() {
  const totalUsers = 15;
  const totalPosts = 30;

  const comments = [];
  let commentIdCounter = 1;
  const postIds = new Map();

  for (let postId = 1; postId <= totalPosts; postId++) {
    postIds.set(postId, []);
    for (let i = 1; i <= 5; i++) {
      postIds.get(postId).push(commentIdCounter);
      const authorId = Math.floor(Math.random() * totalUsers) + 1;
      const content = commentContents[Math.floor(Math.random() * commentContents.length)];
      const isReply = i > 1 && Math.random() < 0.65;
      
      let parentId = null;
      if (isReply) {
        const idArr = postIds.get(postId);
        parentId = idArr[Math.floor(Math.random() * idArr.length)];
      }

      const isHidden = Math.random() < 0.1;
      comments.push({
        content,
        authorId,
        postId,
        parentId,
        isHidden: isHidden ? true : false,
        hiddenReason: isHidden ? hiddenReasons[Math.floor(Math.random() * hiddenReasons.length)] : null,
      });
      commentIdCounter++;
    }
  }

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }
};

async function seedCommentRatings() {
    const totalUsers = 15;
    const totalComments = 150;
  
    const ratings = [];
    for (let userId = 1; userId <= totalUsers; userId++) {
      for (let commentId = 1; commentId <= totalComments; commentId++) {
        const shouldRate = Math.random() < 0.4;
        if (shouldRate) {
          const isUpvote = Math.random() < 0.7;
          ratings.push({
            isUpvote,
            commentId,
            userId,
          });
        }
      }
    }
    await prisma.commentRating.createMany({
      data: ratings,
    });
  };
  
  async function updateCommentVoteCounts() {
    const upvotes = await prisma.commentRating.groupBy({
      by: ['commentId'],
      where: {
        isUpvote: true, // Count only upvotes
      },
      _count: {
        _all: true,
      },
    });
  
    upvotes.forEach(async (upvote) => {
      await prisma.comment.update({
          where: { id: upvote.commentId },
          data: {
              upvoteCount: upvote._count._all,
          },
      });
    });
    
    const downvotes = await prisma.commentRating.groupBy({
      by: ['commentId'],
      where: {
        isUpvote: false, // Count only downvotes
      },
      _count: {
        _all: true,
      },
    });
  
    downvotes.forEach(async (downvote) => {
      await prisma.comment.update({
          where: { id: downvote.commentId },
          data: {
              downvoteCount: downvote._count._all,
          },
      });
    });
  };

async function seedBlogRatings() {
  const totalUsers = 15;
  const totalPosts = 30;

  // Generate ratings focusing on the first 20 blog posts
  const ratings = [];
  for (let userId = 1; userId <= totalUsers; userId++) {
    for (let postId = 1; postId <= totalPosts; postId++) {
      // Favor the first 20 blog posts with higher activity
      const isHidden = postId > 20;
      const shouldRate = isHidden ? Math.random() < 0.1 : Math.random() < 0.5; // 10% for hidden, 50% for visible
      if (shouldRate) {
        const isUpvote = Math.random() < (isHidden ? 0.4 : 0.7); // 40% upvotes for hidden, 70% for visible
        ratings.push({
          isUpvote,
          postId,
          userId,
        });
      }
    }
  }
  await prisma.blogRating.createMany({
    data: ratings,
  });
};

async function updateBlogPostVoteCounts() {
  const upvotes = await prisma.blogRating.groupBy({
    by: ['postId'],
    where: {
      isUpvote: true, // Count only upvotes
    },
    _count: {
      _all: true,
    },
  });

  upvotes.forEach(async (upvote) => {
    await prisma.blogPost.update({
        where: { id: upvote.postId },
        data: {
            upvoteCount: upvote._count._all,
        },
    });
  });
  
  const downvotes = await prisma.blogRating.groupBy({
    by: ['postId'],
    where: {
      isUpvote: false, // Count only downvotes
    },
    _count: {
      _all: true,
    },
  });

  downvotes.forEach(async (downvote) => {
    await prisma.blogPost.update({
        where: { id: downvote.postId },
        data: {
            downvoteCount: downvote._count._all,
        },
    });
  });
  
};

async function seedBlogPostReports() {
  const totalUsers = 15; 
  const totalPosts = 30; 
  
  const reports = new Set(); // To avoid duplicates
  
  while (reports.size < 30) {
    const userId = Math.floor(Math.random() * totalUsers) + 1;
    const postId = Math.floor(Math.random() * totalPosts) + 1;

    const reportKey = `${userId}-${postId}`; // Ensures uniqueness
    if (!reports.has(reportKey)) {
      reports.add(reportKey);
    }
  }

  // Convert set of unique reports to an array of objects
  const reportData = Array.from(reports).map((reportKey) => {
    const [userId, postId] = reportKey.split("-").map(Number);
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    return {
      userId,
      postId,
      reason,
    };
  });

  // Seed the reports into the database
  await prisma.report.createMany({
    data: reportData,
  });
};

async function seedCommentReports() {
    const totalUsers = 15; 
    const totalComments = 50; // There are actually 150 but I want to keep the number of reports low
    
    const reports = new Set(); // To avoid duplicates
    
    while (reports.size < 50) {
      const userId = Math.floor(Math.random() * totalUsers) + 1;
      const commentId = Math.floor(Math.random() * totalComments) + 1;
  
      const reportKey = `${userId}-${commentId}`; // Ensures uniqueness
      if (!reports.has(reportKey)) {
        reports.add(reportKey);
      }
    }
  
    // Convert set of unique reports to an array of objects
    const reportData = Array.from(reports).map((reportKey) => {
      const [userId, commentId] = reportKey.split("-").map(Number);
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      return {
        userId,
        commentId,
        reason,
      };
    });
  
    // Seed the reports into the database
    await prisma.report.createMany({
      data: reportData,
    });
  };

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
                language: "javascript",
            },
            {
                title: "Python Greeter",
                userId: 2,
                explanation: "Print greeting in Python",
                code: 'print("Hello, Python!")',
                file_name: "greet.py",
                language: "python",
            },
            {
                title: "C Math Operations",
                userId: 3,
                explanation: "Basic math operations in C",
                code: '#include<stdio.h>\nint main() {\n  int a = 10, b = 20;\n  printf("Sum: %d", a + b);\n  return 0;\n}',
                file_name: "math.c",
                language: "c",
            },
            {
                title: "Dynamic Arrays in C++",
                userId: 4,
                explanation: "Manage dynamic arrays in C++",
                code: '#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> arr = {1, 2, 3};\n  arr.push_back(4);\n  for (int i : arr) std::cout << i << " ";\n}',
                file_name: "dynamic_array.cpp",
                language: "cpp",
            },
            {
                title: "Java Threads",
                userId: 5,
                explanation: "Simple threading in Java",
                code: 'class MyThread extends Thread {\n  public void run() {\n    System.out.println("Thread is running.");\n  }\n}\npublic class Main {\n  public static void main(String[] args) {\n    new MyThread().start();\n  }\n}',
                file_name: "thread.java",
                language: "java",
            },
            {
                title: "Python Data Processing",
                userId: 6,
                explanation: "Process lists with Python",
                code: "data = [1, 2, 3, 4]\nprint([x**2 for x in data])",
                file_name: "process.py",
                language: "python",
            },
            {
                title: "Simple Calculator in Swift",
                userId: 7,
                explanation: "A basic calculator to perform addition in Swift",
                code: `import Foundation
              let a = 5
              let b = 10
              print("Sum: \\(a + b)")`,
                file_name: "calculator.swift",
                language: "swift",
            },
            {
                title: "Factorial in Java",
                userId: 8,
                explanation: "Calculate factorial using recursion",
                code: "class Main {\n  public static int factorial(int n) {\n    return (n == 1) ? 1 : n * factorial(n - 1);\n  }\n  public static void main(String[] args) {\n    System.out.println(factorial(5));\n  }\n}",
                file_name: "factorial.java",
                language: "java",
            },
            {
                title: "Hello Ruby",
                userId: 9,
                explanation: "Basic Ruby hello world example",
                code: 'puts "Hello, Ruby!"',
                file_name: "hello.rb",
                language: "ruby",
            },
            {
                title: "Fibonacci Sequence in Go",
                userId: 10,
                explanation: "Generate Fibonacci sequence using Go",
                code: `package main
                import "fmt"
                func fibonacci(n int) []int {
                seq := []int{0, 1}
                for len(seq) < n {
                  seq = append(seq, seq[len(seq)-1]+seq[len(seq)-2])
                }
                return seq
                }
                func main() {
                fmt.Println(fibonacci(10))
                }`,
                file_name: "fibonacci.go",
                language: "go",
            },
        ],
    });

    // Seed templates with tags (not forked)
await prisma.codeTemplate.create({
    data: {
      title: "FizzBuzz in Python",
      userId: 15,
      explanation: "Print FizzBuzz for numbers 1 to 100",
      code: 'for i in range(1, 101):\n  if i % 15 == 0:\n    print("FizzBuzz")\n  elif i % 3 == 0:\n    print("Fizz")\n  elif i % 5 == 0:\n    print("Buzz")\n  else:\n    print(i)',
      file_name: "fizzbuzz.py",
      language: "python",
      tags: { connect: [{ id: 1 }, { id: 15 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "QuickSort in C++",
      userId: 14,
      explanation: "QuickSort algorithm implementation",
      code: "#include <iostream>\nvoid quickSort(int[], int, int);\nint main() { /*...*/ }",
      file_name: "quicksort.cpp",
      language: "cpp",
      tags: { connect: [{ id: 3 }, { id: 7 }, { id: 12 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Factorial in JavaScript",
      userId: 12,
      explanation: "Recursive factorial function",
      code: "function factorial(n) {\n  return n === 0 ? 1 : n * factorial(n - 1);\n}",
      file_name: "factorial.js",
      language: "javascript",
      tags: { connect: [{ id: 4 }, { id: 9 }, { id: 16 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Palindrome Checker in Rust",
      userId: 13,
      explanation: "Checks if a string is a palindrome using Rust",
      code: `fn is_palindrome(s: &str) -> bool {
    let reversed: String = s.chars().rev().collect();
    s == reversed
  }
  fn main() {
    println!("Is 'racecar' a palindrome? {}", is_palindrome("racecar"));
  }`,
      file_name: "palindrome.rs",
      language: "rust",
      tags: { connect: [{ id: 6 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Binary Search Tree in Java",
      userId: 11,
      explanation: "Implementation of BST",
      code: "class Node { int key; Node left, right; }\nclass BST { /*...*/ }",
      file_name: "bst.java",
      language: "java",
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
      language: "c",
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
      language: "python",
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
      language: "javascript",
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
      language: "java",
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
      language: "cpp",
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
      language: "javascript",
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
      language: "python",
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
      language: "cpp",
      isFork: true,
      originalId: 4,
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "Ruby Array Manipulation",
      userId: 1,
      explanation: "Basic array operations in Ruby",
      code: 'arr = [1, 2, 3, 4]\narr.push(5)\nputs arr.inspect',
      file_name: "array.rb",
      language: "ruby",
      isFork: true,
      originalId: 9,
    },
  });

  // Seed forked templates (with tags)
  await prisma.codeTemplate.create({
    data: {
      title: "Scriptorium (forked)",
      userId: 11,
      explanation: "CSC309 PP1 (forked)",
      code: `console.log("Hello Whole Wide World");`,
      file_name: "index.js",
      language: "javascript",
      isFork: true,
      originalId: 1,
      tags: {
        connect: [{ id: 1 }, { id: 4 }, { id: 5 }],
      },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "ToDo List in TypeScript",
      userId: 13,
      explanation: "Basic TypeScript example managing a ToDo list",
      code: `let todos: string[] = ["Learn Prisma", "Build API"];
      todos.push("Test Application");
      console.log(todos);`,
      file_name: "todo_list.php",
      language: "php",
      isFork: true,
      originalId: 1,
      tags: { connect: [{ id: 11 }] },
    },
  });
  
  await prisma.codeTemplate.create({
    data: {
      title: "QuickSort in C++ (Forked)",
      userId: 15,
      explanation: "QuickSort with optimized pivot selection",
      code: `#include <iostream>
      void quickSort(int[], int, int);
      int main() { /* Enhanced logic here */ }`,
      file_name: "quicksort_optimized.cpp",
      language: "cpp",
      isFork: true,
      originalId: 23,
      tags: { connect: [{ id: 7 }, { id: 14 }] },
    },
  });

  await prisma.codeTemplate.create({
    data: {
        title: "FizzBuzz in Python (Forked)",
        userId: 14,
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
        language: "python",
        isFork: true,
        originalId: 1,
        tags: { connect: [{ id: 11 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "QuickSort in C++ (Forked Again)",
        userId: 12,
        explanation: "QuickSort with optimized pivot selection",
        code: `#include <iostream>
void quickSort(int[], int, int);
int main() { /* Enhanced logic here */ }`,
        file_name: "quicksort_optimized.cpp",
        language: "cpp",
        isFork: true,
        originalId: 23,
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
        language: "javascript",
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
        language: "python",
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
        language: "java",
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
        language: "python",
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
        language: "java",
        isFork: true,
        originalId: 32,
        tags: { connect: [{ id: 2 }, { id: 9 }, { id: 16 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Swift Prime Number Checker (Forked)",
        userId: 8,
        explanation: "Check for prime numbers in Swift",
        code: 'func isPrime(_ number: Int) -> Bool {\n  if number < 2 { return false }\n  for i in 2..<number {\n    if number % i == 0 { return false }\n  }\n  return true\n}\nprint(isPrime(7))',
        file_name: "prime_checker.swift",
        language: "swift",
        isFork: true,
        originalId: 7,
        tags: { connect: [{ id: 7 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "HTTP Server in Go",
        userId: 5,
        explanation: "Simple HTTP server using Go's net/http package",
        code: `package main
        import (
        "fmt"
        "net/http"
        )
        func handler(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, World!")
        }
        func main() {
        http.HandleFunc("/", handler)
        http.ListenAndServe(":8080", nil)
        }`,
        file_name: "http_server.go",
        language: "go",
        isFork: true,
        originalId: 10,
        tags: { connect: [{ id: 6 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "CRUD Operations (Forked)",
        userId: 14,
        explanation: "CRUD with logging",
        code: 'let db = [];\nfunction create(item) { db.push(item); console.log("Created:", item); }\nfunction read() { return db; }',
        file_name: "crud_logging.js",
        language: "javascript",
        isFork: true,
        originalId: 8,
        tags: { connect: [{ id: 9 }, { id: 14 }, { id: 18 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Web Scraper in Python (Forked)",
        userId: 12,
        explanation: "Scrape with pagination support",
        code: 'import requests\nfrom bs4 import BeautifulSoup\ndef scrape_pages(urls):\n  for url in urls:\n    resp = requests.get(url)\n    soup = BeautifulSoup(resp.text, "html.parser")\n    print(soup.title)',
        file_name: "scraper_pages.py",
        language: "python",
        isFork: true,
        originalId: 12,
        tags: { connect: [{ id: 5 }, { id: 11 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "Factorial in Rust",
        userId: 15,
        explanation: "Calculates factorial of a number using recursion in Rust",
        code: `fn factorial(n: u32) -> u32 {
        if n == 0 { 1 } else { n * factorial(n - 1) }
      }
      fn main() {
        println!("Factorial of 5 is: {}", factorial(5));
      }`,
        file_name: "factorial.rs",
        language: "rust",
        isFork: true,
        originalId: 12,
        tags: { connect: [{ id: 4 }, { id: 12 }, { id: 19 }, { id: 10 }] },
    },
});

await prisma.codeTemplate.create({
    data: {
        title: "TypeScript Interface Example",
        userId: 1,
        explanation: "Demonstrates usage of interfaces in TypeScript",
        code: `interface User {
id: number;
name: string;
}
const user: User = { id: 1, name: "Ethan" };
console.log(user);`,
        file_name: "interface_example.php",
        language: "php",
        isFork: true,
        originalId: 26,
        tags: { connect: [{ id: 8 }, { id: 14 }, { id: 17 }, { id: 7 }] },
    },
});

await prisma.codeTemplate.createMany({
    data: [
        {
            title: "File Reading in Ruby",
            userId: 11,
            explanation: "Read and print file contents in Ruby",
            code: `File.open("example.txt").each { |line| puts line }`,
            file_name: "read_file.rb",
            language: "ruby",
        },
        {
            title: "Dictionary in Swift",
            userId: 9,
            explanation: "Demonstrates creating and accessing a dictionary in Swift",
            code: `var capitals: [String: String] = ["Canada": "Ottawa", "Japan": "Tokyo"]
        print(capitals["Canada"] ?? "Unknown")`,
            file_name: "dictionary.swift",
            language: "swift",
        },
        {
            title: "Factorial Calculation in Go",
            userId: 2,
            explanation: "Recursive function to calculate the factorial of a number",
            code: `package main
        import "fmt"
        func factorial(n int) int {
        if n == 0 {
        return 1
        }
        return n * factorial(n-1)
        }
        func main() {
        number := 5
        fmt.Printf("Factorial of %d is %d\\n", number, factorial(number))
        }`,
            file_name: "factorial.go",
            language: "go",
        },
        {
            title: "Matrix Multiplication in Rust",
            userId: 8,
            explanation: "Performs matrix multiplication on two 2x2 matrices",
            code: `fn multiply_matrices(a: [[i32; 2]; 2], b: [[i32; 2]; 2]) -> [[i32; 2]; 2] {
        let mut result = [[0; 2]; 2];
        for i in 0..2 {
        for j in 0..2 {
            for k in 0..2 {
            result[i][j] += a[i][k] * b[k][j];
            }
        }
        }
        result
        }
        fn main() {
        let a = [[1, 2], [3, 4]];
        let b = [[5, 6], [7, 8]];
        let result = multiply_matrices(a, b);
        println!("Resulting matrix: {:?}", result);
        }`,
            file_name: "matrix_multiplication.rs",
            language: "rust",
        },
        {
            title: "Array Sorting in TypeScript",
            userId: 7,
            explanation: "Sorts an array of numbers using the bubble sort algorithm",
            code: `const bubbleSort = (arr: number[]): number[] => {
        let n = arr.length;
        for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
        }
        return arr;
        };
        const numbers = [64, 34, 25, 12, 22, 11, 90];
        console.log("Sorted Array:", bubbleSort(numbers));`,
            file_name: "bubble_sort.php",
            language: "php",
        },
]});
    
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

    await seedBlogRatings();
    await updateBlogPostVoteCounts();
    await seedComments();
    await seedCommentRatings();
    await updateCommentVoteCounts();
    await seedBlogPostReports();
    await seedCommentReports();

    console.log("Database has been seeded successfully!");
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
