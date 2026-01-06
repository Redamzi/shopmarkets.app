FROM nginx:alpine

# Copy custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directory for uploads (volume mount point)
RUN mkdir -p /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
