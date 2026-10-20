
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Store, Star, Search, LogOut, UserRound, ShieldCheck,
  MapPin, Users, RefreshCw
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState("");
  const [account, setAccount] = useState(null);
  const [page, setPage] = useState("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    address: "",
    password: ""
  });

  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState({});
  const [dashboard, setDashboard] = useState(null);

  const client = axios.create({
    baseURL: API,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {}
  });

  function notify(text) {
    setError("");
    setMessage(text);
  }

  function fail(err) {
    setMessage("");
    setError(
      err.response?.data?.message ||
      "Something went wrong. Check that your backend is running."
    );
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(`${API}/auth/login`, loginForm);

      setToken(data.token);
      setAccount(data.user);
      setPage(data.user.role === "owner" ? "dashboard" : "stores");
      setLoginForm({ email: "", password: "" });
      notify("Login successful!");

    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(
        `${API}/auth/register`,
        registerForm
      );

      notify(data.message || "Registration successful. Please log in.");
      setLoginForm({
        email: registerForm.email,
        password: ""
      });
      setRegisterForm({
        name: "",
        email: "",
        address: "",
        password: ""
      });
      setPage("login");

    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }


async function loadStores(searchTerm = search) {
  try {
    setError("");

    const { data } = await client.get("/stores", {
      params: { search: searchTerm.trim() },
    });

    setStores(data.stores || []);

    setRatings((previous) => {
      const updated = { ...previous };

      for (const store of data.stores || []) {
        updated[store.id] = String(
          previous[store.id] ?? store.myRating ?? ""
        );
      }

      return updated;
    });
  } catch (err) {
    fail(err);
  }
}


  async function submitRating(storeId) {
    const rating = Number(ratings[storeId]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5.");
      return;
    }

    setBusy(true);

    try {
      await client.put(`/ratings/${storeId}`, { rating });
      notify("Your rating has been saved.");
      await loadStores();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function loadDashboard() {
    try {
      const { data } = await client.get("/owner/dashboard");
      setDashboard(data);
    } catch (err) {
      fail(err);
    }
  }

  useEffect(() => {
    if (!token || !account) return;

    if (account.role === "owner") {
      loadDashboard();
    } else {
      loadStores();
    }
  }, [token, account]);

  function logout() {
    setToken("");
    setAccount(null);
    setStores([]);
    setDashboard(null);
    setRatings({});
    setSearch("");
    setMessage("");
    setError("");
    setPage("login");
  }

  if (!account) {
    return (
      <main className="auth-layout">
        <section className="auth-card">
          <div className="brand">
            <div className="brand-icon"><Store size={25} /></div>
            <div>
              <h1>NexaPrime</h1>
              <p>Store Rating Platform</p>
            </div>
          </div>

          <div className="auth-heading">
            <h2>{page === "register" ? "Create your account" : "Welcome back"}</h2>
            <p>
              {page === "register"
                ? "Join NexaPrime to discover and rate stores."
                : "Sign in to explore stores and manage ratings."}
            </p>
          </div>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert danger">{error}</div>}

          {page === "register" ? (
            <form onSubmit={handleRegister} className="form">
              <label>Full name</label>
              <input
                required minLength={20} maxLength={60}
                placeholder="Your full name (20–60 characters)"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({
                  ...registerForm, name: e.target.value
                })}
              />

              <label>Email address</label>
              <input
                required type="email" placeholder="you@example.com"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({
                  ...registerForm, email: e.target.value
                })}
              />

              <label>Address</label>
              <textarea
                required maxLength={400} rows={3}
                placeholder="Your address (maximum 400 characters)"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({
                  ...registerForm, address: e.target.value
                })}
              />

              <label>Password</label>
              <input
                required type="password" minLength={8} maxLength={16}
                placeholder="8–16 characters, uppercase and special character"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({
                  ...registerForm, password: e.target.value
                })}
              />

              <button className="primary-button" disabled={busy}>
                {busy ? "Please wait..." : "Create account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="form">
              <label>Email address</label>
              <input
                required type="email" placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({
                  ...loginForm, email: e.target.value
                })}
              />

              <label>Password</label>
              <input
                required type="password" placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({
                  ...loginForm, password: e.target.value
                })}
              />

              <button className="primary-button" disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <p className="switch-auth">
            {page === "register"
              ? "Already have an account?"
              : "New to NexaPrime?"}
            <button
              className="text-button"
              onClick={() => {
                setError("");
                setMessage("");
                setPage(page === "register" ? "login" : "register");
              }}
            >
              {page === "register" ? "Sign in" : "Create account"}
            </button>
          </p>

          <p className="auth-footnote">
            Secure account access · One rating per store
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="brand compact">
          <div className="brand-icon"><Store size={22} /></div>
          <div>
            <h1>NexaPrime</h1>
            <p>Store Rating Platform</p>
          </div>
        </div>

        <div className="account-area">
          <div className="account-info">
            <span className="avatar"><UserRound size={19} /></span>
            <div>
              <strong>{account.name}</strong>
              <small>{account.role === "owner" ? "Store Owner" : "Normal User"}</small>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={17} /> <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="page-content">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert danger">{error}</div>}

        {account.role === "owner" ? (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow"><ShieldCheck size={15} /> OWNER WORKSPACE</p>
                <h2>Store dashboard</h2>
                <p>Monitor customer ratings for your store.</p>
              </div>
              <button className="secondary-button" onClick={loadDashboard}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {!dashboard ? (
              <div className="empty-state">Loading your dashboard...</div>
            ) : (
              <>
                <section className="store-banner">
                  <div className="store-banner-icon"><Store size={27} /></div>
                  <div>
                    <p className="eyebrow">YOUR STORE</p>
                    <h3>{dashboard.store.name}</h3>
                    <p><MapPin size={15} /> {dashboard.store.address}</p>
                  </div>
                </section>

                <section className="stats-grid">
                  <article className="stat-card">
                    <span className="stat-icon gold"><Star size={20} /></span>
                    <p>Average rating</p>
                    <h3>
                      {dashboard.averageRating == null
                        ? "—"
                        : Number(dashboard.averageRating).toFixed(1)}
                      <small> / 5</small>
                    </h3>
                  </article>
                  <article className="stat-card">
                    <span className="stat-icon blue"><Users size={20} /></span>
                    <p>Total ratings</p>
                    <h3>{dashboard.totalRatings}</h3>
                  </article>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Customer ratings</h3>
                      <p>Users who have rated your store.</p>
                    </div>
                  </div>

                  {dashboard.ratings.length === 0 ? (
                    <div className="empty-state">No ratings received yet.</div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Rating</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.ratings.map((item, index) => (
                            <tr key={`${item.user?.email}-${index}`}>
                              <td>{item.user?.name || "Unknown user"}</td>
                              <td>{item.user?.email || "Unavailable"}</td>
                              <td><span className="rating-pill">
                                <Star size={14} fill="currentColor" />
                                {item.rating}/5
                              </span></td>
                              <td>{new Date(item.submittedAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">DISCOVER & RATE</p>
                <h2>Find your next store</h2>
                <p>Explore stores, check ratings, and share your experience.</p>
              </div>
            </div>

            <form
              className="search-bar"
              onSubmit={(e) => {
                e.preventDefault();
                loadStores();
              }}
            >
              <Search size={20} />
              <input
                placeholder="Search stores by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="primary-button" type="submit">Search</button>
            </form>

            <div className="results-heading">
              <h3>Available stores</h3>
              <span>{stores.length} results</span>
            </div>

            {stores.length === 0 ? (
              <div className="empty-state">
                <Store size={35} />
                <h3>No stores found</h3>
                <p>Try another search term or check back later.</p>
              </div>
            ) : (
              <section className="store-grid">
                {stores.map((store) => (
                  <article className="store-card" key={store.id}>
                    <div className="store-card-top">
                      <div className="store-card-icon"><Store size={23} /></div>
                      <span className="rating-pill">
                        <Star size={14} fill="currentColor" />
                        {store.averageRating == null
                          ? "No ratings"
                          : Number(store.averageRating).toFixed(1)}
                      </span>
                    </div>

                    <h3>{store.name}</h3>
                    <p className="store-address">
                      <MapPin size={15} /> {store.address}
                    </p>
                    <p className="rating-count">
                      {store.totalRatings} {store.totalRatings === 1 ? "rating" : "ratings"}
                    </p>

                    <div className="rate-section">
                      <label>Your rating</label>
                      <div className="rate-controls">
                        <select
                          aria-label={`Your rating for ${store.name}`}
                          value={ratings[store.id] ?? ""}
                          onChange={(e) => setRatings({
                            ...ratings,
                            [store.id]: e.target.value
                          })}
                        >
                          <option value="">Choose rating</option>
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option value={value} key={value}>
                              {value} {value === 1 ? "star" : "stars"}
                            </option>
                          ))}
                        </select>
                        <button
                          className="primary-button"
                          disabled={busy}
                          onClick={() => submitRating(store.id)}
                        >
                          Submit
                        </button>
                      </div>
                      {store.myRating != null && (
                        <small className="existing-rating">
                          Your current rating: {store.myRating}/5
                        </small>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        NexaPrime · Store Rating Platform
      </footer>
    </div>
  );
}
