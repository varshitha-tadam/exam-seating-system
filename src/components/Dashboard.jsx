import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }

const interaval = setInterval(() => {
  axios
    .get("http://localhost:8080/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch(() => {
      alert("Session expired. Please login again.");
      logout();
    });

}, 30000); // ✅ ADD THIS (5 seconds)


    return ()=>clearInterval(interaval);

  }, [token]); 

  async function getAllUsers() {
    try {
      const res = await axios.get("http://localhost:8080/allusers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired");
        logout();
      } else {
        console.error("Error fetching users:", err);
      }
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <>
      <h2>Dashboard</h2>
      <p>Logged in as: {email}</p>

      <button onClick={getAllUsers}>Get All Users</button>
      <button onClick={logout}>Logout</button>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Dashboard;