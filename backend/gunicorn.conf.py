import multiprocessing

# Gunicorn configuration file
# https://docs.gunicorn.org/en/stable/configure.html

# Server socket
bind = "0.0.0.0:5000"

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Timeout
timeout = 120

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
