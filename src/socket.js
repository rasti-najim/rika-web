import io from "socket.io-client";

const ENDPOINT = "http://localhost:8080"; // Your server URL
const socket = io(ENDPOINT, {
  query: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjljM2Y5ZGIyLWU4MGMtNDg5NC04ZWMyLTNmZmU5ZWY2ZjE1NCIsImlhdCI6MTcwNDQzNDM2OSwiZXhwIjoxNzA0NDM3OTY5fQ.BVVgnnt_TkrLHmfYu4WaS4_p4Gjo1o0qHX9jNacar0k", // Client sends the JWT token here
  },
});

export default socket;
