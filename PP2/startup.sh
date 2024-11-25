#!/bin/bash
chmod +x startup.sh
cat <<EOL > .env
DATABASE_URL="file:./dev.db"
BCRYPT_SALT_ROUNDS=10
JWT_SECRET_ACCESS="ARGNQ23TB346NIYENGNnianirag325"
JWT_EXPIRES_IN_ACCESS="1h"
JWT_SECRET_REFRESH="agrinu36w53wt53wkngrgnorseq235"
JWT_EXPIRES_IN_REFRESH="6h"
EOL

npm i bcrypt
npm i jsonwebtoken
npm i multer
npm i prisma @prisma/client @prisma/studio
npx prisma generate
npx prisma migrate dev



ADMIN_USERNAME="starkee"
ADMIN_PASSWORD="ethan123"

#simple script for checking if compilers are installed with help from copilot

check_compiler() {
    if command -v $1 &> /dev/null
    then
        echo "$1 is installed"
    else
        echo "$1 is not installed"
    fi
}

# Check for Java
check_compiler java

# Check for Python3
check_compiler python3

# Check for Node.js
check_compiler node

# Check for C
check_compiler gcc

# Check for C++
check_compiler g++

