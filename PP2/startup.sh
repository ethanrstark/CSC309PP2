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
npm i jwt-decode
npm i @heroicons/react
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



# Build Python Docker image
docker build -t my-python-image -f Dockerfile.python .

# Build JavaScript Docker image
docker build -t my-javascript-image -f Dockerfile.javascript .


# Build Ruby Docker image
docker build -t my-ruby-image -f Dockerfile.ruby .

#Build C docker image
docker build -t my-c-image -f Dockerfile.c .

#build C++ docker image

docker build -t my-cpp-image -f Dockerfile.cpp .

#build java image

docker build -t my-java-image -f Dockerfile.java .

#build rust image

docker build -t my-rust-image -f Dockerfile.rust .

#build go image

docker build -t my-go-image -f Dockerfile.go .

#build php image

docker build -t my-php-image -f Dockerfile.php .

#build swift image

docker build -t my-swift-image -f Dockerfile.swift .


