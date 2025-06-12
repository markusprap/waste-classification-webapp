FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN mkdir -p prisma && cp database/prisma/schema.prisma prisma/schema.prisma || (echo "schema.prisma not found" && ls -l database/prisma && exit 1)
RUN npx prisma generate
RUN mkdir -p public/uploads/articles
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
