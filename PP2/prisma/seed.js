import prisma from '../utils/db.js';
import { hashPassword } from '../utils/auth.js';


async function main() {
    // Seed an admin user
    await prisma.user.create({
        data: {
            userName: "starkee",
            password: await hashPassword("ethan123"),
            firstName: "Ethan",
            lastName: "Stark",
            email: "ethan24@gmail.com",
            role: "ADMIN",
        }
    });

    // Seed a regular user
    await prisma.user.create({
        data: {
            userName: "meep",
            password: await hashPassword("meep123"),
            firstName: "Mee",
            lastName: "Moo",
            email: "moop@gmail.com",
        }
    });

    // Seed tags so there is enough to test pagination
    await prisma.tag.createMany({
      data: [
        { name: 'Forked' },
        { name: 'October' },
        { name: 'JavaScript' },
        { name: 'Python' },
        { name: 'School' },
      ]
    });

    // Seed code templates so there is enough to test pagination TODO add more
    await prisma.codeTemplate.createMany({
        data: [
        { title: 'Scriptorium', userId: 1, explanation: 'CSC309 PP1', code: 'console.log("Hello World");', 
            file_name: 'index.js', language: 'JavaScript' },
        { title: 'Startup', userId: 1, explanation: 'Best new AI startup', code: 'printf("Hello World");', 
            file_name: 'ai.c', language: 'C' },
        ]
      });

    // Seed a code template that is forked
    await prisma.codeTemplate.create({ 
        data: {
            title: 'Scriptorium (forked)', 
            userId: 1, 
            explanation: 'CSC309 PP1 (forked)', 
            code: 'console.log("Hello Whole Wide World");', 
            file_name: 'index.js', 
            language: 'JavaScript',
            isFork: true,
            originalId: 1,
        }
    });

    // Seed a blog post and connect it to a user, tags, and code templates
    await prisma.blogPost.create({
        data: { 
            title: 'Why AI is bad', 
            description: 'I h8 AI', 
            authorId: 1, 
            tags: { 
                connect: [ 
                    { id: 4 }, 
                    { id: 5 } 
                ]
            }, 
            templates: { 
                connect: [ 
                    { id: 1 }, 
                    { id: 2 } 
                ]
            },
        }, 
    });

    // Seed a blog post and connect it to a user, tags, and code templates
    await prisma.blogPost.create({
        data: { 
            title: 'Why AI is good', 
            description: 'I <3 AI', 
            authorId: 1, 
            tags: { 
                connect: [ 
                    { id: 1 }, 
                    { id: 3 } 
                ]
            }, 
            templates: { 
                connect: [ 
                    { id: 1 }, 
                    { id: 3 } 
                ]
            },
        }, 
    });

    // Seed a hidden blog post
    await prisma.blogPost.create({
        data: { 
            title: 'Hidden Post', 
            description: 'author is admin', 
            authorId: 1, 
            isHidden: true,
        }, 
    });

    // Seed a hidden blog post 
    await prisma.blogPost.create({
        data: { 
            title: 'Hidden Post', 
            description: 'author is not admin', 
            authorId: 2, 
            isHidden: true,
        }, 
    });

    // Seed 2 comments and connect it to a user and blog post
    await prisma.comment.createMany({
        data: [
            { 
                content: 'I agree', 
                authorId: 1, 
                postId: 1,
            }, 
            { 
                content: 'Me too', 
                authorId: 2, 
                postId: 1,
            }, 
        ],
    });

    // Seed a few replies to the first comment
    await prisma.comment.createMany({
        data: [
            { 
                content: 'edit: nvm', 
                authorId: 1, 
                parentId: 1,
                postId: 1,
            }, 
            { 
                content: 'You gots to be right', 
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
                    reason: 'Innapropriate content', 
                    commentId: 1,
                    userId: 1,
                }, 
                { 
                    //set 2 reports for post 1
                    reason: 'Harmful content', 
                    postId: 1,
                    userId: 1,
                }, 
                { 
                    reason: 'Harmful content', 
                    postId: 1,
                    userId: 2,
                },
                //set 2 reports for comment 2
                { 
                    reason: 'Innapropriate content', 
                    commentId: 2,
                    userId: 1,
                }, 
                { 
                    reason: 'Innapropriate content', 
                    commentId: 2,
                    userId: 2,
                },
                //set 1 report for post 2
                { 
                    reason: 'Harmful content', 
                    postId: 2,
                    userId: 1,
                },
            ],
        });

    console.log('Database has been seeded successfully!');
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
