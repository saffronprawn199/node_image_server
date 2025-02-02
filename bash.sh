for i in {1..2}; do
  curl --location "http://localhost:3000/api/image?filename=download.png&width=11&height=11" --header 'x-api-key: 1234567890'  # Replace with your actual API endpoint
 
  #curl --location "http://localhost:3000/api/image/test-auth" --header 'x-api-key: 1234567890'  # Replace with your actual API endpoint

  # Add other curl options if needed, e.g., -H "Authorization: Bearer YOUR_TOKEN"
  sleep 0.1  # Optional: Add a delay to avoid overwhelming the server
done