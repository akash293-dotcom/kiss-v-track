import { useState, useRef } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  BarChart3,
  Lightbulb,
  Users,
  ArrowRight,
  UserCog,
} from "lucide-react";
import api from "../../lib/api";
import "./LoginPage.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordSectionRef = useRef<HTMLDivElement>(null);

  const handleEmailFocus = () => {
    setTimeout(() => {
      passwordSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data?.data;

      if (!data?.token || !data?.user) {
        alert("Login failed: invalid server response.");
        return;
      }

      if (remember) {
        localStorage.setItem("token", data.token);
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", data.token);
        localStorage.removeItem("token");
      }

      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);

      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Please contact your administrator to reset your password.");
  };

  const handleAdminContact = () => {
    alert("Please contact your KISS V-TRACK administrator.");
  };

  return (
    <div className="login-page">

      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
      <div className="bg-circle circle-3"></div>

      <div className="bg-dots"></div>

      <div className="curve curve-left"></div>
      <div className="curve curve-bottom"></div>

      <div className="floating-note note-left">
        <BarChart3 size={26} />
        <span>
          Track your progress.
          <br />
          Grow everyday!
        </span>

        <div className="note-arrow">↗</div>
      </div>

      <div className="floating-note note-right">
        <Lightbulb size={24} />

        <span>
          Skills today
          <br />
          Better tomorrow
        </span>

        <div className="note-line"></div>
      </div>

      <div className="paper-plane">
        ➤
      </div>

      <main className="login-container">

        <div className="brand-section">

          <div className="cap-icon">
            🎓
          </div>

          <h1>
            KISS <span>V-TRACK</span>
          </h1>

          <p>
            Learn. Practice. Create. Get Skilled.
          </p>

        </div>

        <div className="features">

          <div className="feature">
            <div className="feature-icon blue">
              <BookOpen size={26} />
            </div>

            <strong>Learn</strong>

            <small>
              Access resources
            </small>
          </div>

          <div className="feature">
            <div className="feature-icon green">
              <BarChart3 size={26} />
            </div>

            <strong>Practice</strong>

            <small>
              Track progress
            </small>
          </div>

          <div className="feature">
            <div className="feature-icon yellow">
              <Lightbulb size={26} />
            </div>

            <strong>Create</strong>

            <small>
              Build your skills
            </small>
          </div>

          <div className="feature">
            <div className="feature-icon pink">
              <Users size={26} />
            </div>

            <strong>Get Skilled</strong>

            <small>
              Be future ready
            </small>
          </div>

        </div>

        <div className="login-card">

          <div className="welcome">

            <h2>
              Welcome back!
            </h2>

            <p>
              Sign in to continue to KISS V-TRACK
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Email address
              </label>

              <div className="input-wrapper">

                <Mail size={23} />

                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            <div
              className="form-group"
              ref={passwordSectionRef}
            >

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={23} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>

              </div>

            </div>

            <div className="options">

              <label className="remember">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span className="custom-checkbox">
                  {remember ? "✓" : ""}
                </span>

                <span>
                  Keep me signed in
                </span>

              </label>

              <button
                type="button"
                className="forgot"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="sign-in-button"
              disabled={loading}
            >

              <span>
                {loading ? "Signing in..." : "Sign in"}
              </span>

              {!loading && (
                <ArrowRight size={25} />
              )}

            </button>

          </form>

          <div className="divider">

            <span></span>

            <p>
              or
            </p>

            <span></span>

          </div>

          <button
            type="button"
            className="admin-button"
            onClick={handleAdminContact}
          >

            <UserCog size={23} />

            <span>
              Contact your administrator
            </span>

          </button>

        </div>

      </main>

    </div>
  );
}