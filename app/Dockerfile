FROM php:8.1-apache

# Cài đặt extension mysqli để kết nối MySQL
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Sao chép mã nguồn ứng dụng PHP vào thư mục gốc của Apache
COPY index.php /var/www/html/

# Phân quyền cho Apache
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
