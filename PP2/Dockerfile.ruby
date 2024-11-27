# Dockerfile.ruby
FROM ruby:3.0-slim

WORKDIR /app


CMD ["ruby", "script.rb"]