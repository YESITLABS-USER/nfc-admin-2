import React, { useEffect, useState, useRef } from "react";
import logo from "/images/login-page/logo.svg"
import email_svg from "/images/login-page/icons/email.svg"
import password_svg from "/images/login-page/icons/password.svg"
import success_svg from "/images/login-page/login-succ.svg"
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from 'react-bootstrap';
import CryptoJS from "crypto-js";
import { login } from "../redux/slices/adminSlice.js";
import { useDispatch, useSelector } from "react-redux";
import ForgotPasswordModal from "./ForgotPasswordModals.jsx";
import ForgotPasswordModals from "./ForgotPasswordModals.jsx";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, admin } = useSelector((state) => state.admin)

  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAdmin = localStorage.getItem("nfc-admin");
      if (storedAdmin || admin) {
        setShowModal(true);
      }
    }
  }, [admin]);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  };

  const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) return value;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password }));
      if (admin) {
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      setLoginError(err?.message || "Login failed. Please try again.");
    }

    const encryptedPassword = CryptoJS.AES.encrypt(password, "secretKey").toString();
    if (keepLoggedIn) {
      setCookie("email", email, 7);
      setCookie("password", encryptedPassword, 7);
    }
  };

  useEffect(() => {
    const savedEmail = getCookie("email");
    const encryptedPassword = getCookie("password");

    if (savedEmail && encryptedPassword) {
      try {
        const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, "secretKey").toString(CryptoJS.enc.Utf8);
        setEmail(savedEmail);
        setPassword(decryptedPassword);
        setKeepLoggedIn(true);
      } catch (error) {
        console.error("Error decrypting password:", error);
      }
    }
  }, []);


  // forgot password changes email modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
//   const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
//   const [forgotPasswordError, setForgotPasswordError] = useState(null);
//   const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);


//     // forgot password changes otp modal

//     const [showOtpModal, setShowOtpModal] = useState(false);
//     const [otp, setOtp] = useState(["", "", "", ""]);
//     const [otpError, setOtpError] = useState(null);
  
//     const [countdown, setCountdown] = useState(20);
//     const otpInputRefs = useRef([]);

//  // forgot password changes: create new password otp

//  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
//  const [newPassword, setNewPassword] = useState("");
//  const [confirmPassword, setConfirmPassword] = useState("");
//  const [passwordError, setPasswordError] = useState(null);

  // const handleForgotPasswordSubmit = (e) => {
  //   // console.log("hello........" )
  //   console.log("email@@@@", forgotPasswordEmail)
  //   e.preventDefault();
  //   setForgotPasswordError(null);
  //   setForgotPasswordSuccess(null);

  //   if (!forgotPasswordEmail) {
  //     setForgotPasswordError("Please enter your email address");
  //     return;
  //   }

  //   // try {
  //   // Add your forgot password API call here
  //   // Example:
  //   // const response = await forgotPasswordAPI(forgotPasswordEmail);
  //   // if (response.success) {
  //   //   setForgotPasswordSuccess("Password reset link sent to your email");
  //   // } else {
  //   //   setForgotPasswordError(response.message);
  //   // }

  //   // For now, just simulate success
  //   //   setForgotPasswordSuccess("Password reset link sent to your email");
  //   //   // setTimeout(() => {
  //   //   //   setShowForgotPasswordModal(false);
  //   //   // }, 2000);
  //   // } catch (err) {
  //   //   setForgotPasswordError(err.message || "Failed to send reset link");
  //   // }

  //   setShowForgotPasswordModal(false);
  //   setShowOtpModal(true);
  // };



  // useEffect(() => {
  //   if (showOtpModal && countdown > 0) {
  //     const timer = setInterval(() => {
  //       setCountdown((prev) => prev - 1);
  //     }, 1000);
  //     return () => clearInterval(timer);
  //   }
  // }, [showOtpModal, countdown]);

  // const handleVerifyOtp = (e) => {
  //   e.preventDefault();
  //   console.log("otp@@@@@", otp);
  //   const enteredOtp = otp.join(""); // assuming otp is ['1', '2', '3', '4', '5']
  //   if (enteredOtp === "123456") {
  //     alert("OTP Verified!");
  //     setShowOtpModal(false);
  //     setShowCreatePasswordModal(true);
  //   }
  //   else {
  //     setOtpError("Invalid OTP. Please try again.");
  //   }
  // };

  // const handleCreatePassword = (e) => {
  //   console.log("new password", newPassword);
  //   console.log("confirmPassword", confirmPassword);
  //   e.preventDefault();

  //   if (!newPassword || !confirmPassword) {
  //     setPasswordError("Please fill both fields.");
  //     return;
  //   }

  //   if (newPassword !== confirmPassword) {
  //     setPasswordError("Password do not match.");
  //     return;
  //   }

  //   if (newPassword.length<6) {
  //     setPasswordError("Password must be at least 6 characters.");
  //     return;
  //   }

  //   alert("Password reset successful!");
  //   setShowCreatePasswordModal(false);

  //   setNewPassword("");
  //   setConfirmPassword("");
  // }

  // const handleCloseForgotPasswordModal = () => {
  //   console.log("skldjf")
  //   setForgotPasswordEmail("");
  //   setForgotPasswordError(null);
  //   setForgotPasswordSuccess(null);
  //   setShowForgotPasswordModal(false);
    
  // }

  // const handleCloseCreatePasswordModal = () => {
  //   setNewPassword("");
  //   setConfirmPassword("");
  //   setPasswordError(null);
  //   setShowCreatePasswordModal(false);
  // }

  return (
    <div className="login-wrap">
      <div className="login-in">
        <div className="login-logo">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <h1>Welcome to Tagis</h1>
        </div>
        <div className="login-form">
          <form className="animate__animated animate__bounceIn" onSubmit={handleSubmit}>
            <h1>Admin Login</h1>
            <hr />
            <label className="login-lbl">
              <img src={email_svg} alt="Email Icon" />
              <input
                type="email"
                name="email"
                className="login-txt"
                value={email}
                onChange={(e) => { setLoginError(''); setEmail(e.target.value) }}
                placeholder="Enter your Email here"
                required
              />
            </label>
            <label className="login-lbl mb-0">
              <img src={password_svg} alt="Password Icon" />
              <input
                type={passwordVisible ? "text" : "password"}
                className="login-txt"
                id="password"
                name="password"
                value={password}
                onChange={(e) => { setLoginError(''); setPassword(e.target.value) }}
                placeholder="Enter your Password"
                required
              />
              <div className="password-eye" onClick={togglePasswordVisibility}>
                <i className={passwordVisible ? "fas fa-eye" : "fas fa-eye-slash"} id="eye"></i>
              </div>
            </label>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <div className="rembr-me" >
                <input type="checkbox" name="rembr-me" checked={keepLoggedIn} onChange={(e) => setKeepLoggedIn(e.target.checked)} /> Keep me logged in
              </div>
              <div style={{ width: "100%", textAlign: "end", color: "#199FD9", cursor: "pointer" }} onClick={() => setShowForgotPasswordModal(true)}>
                Forgot password?
                {/* <a href="#" onclick={(e) => 
              {e.preventDefault(); 
                setShowForgotPasswordModal(true);

              }}>
              Forgot password?
                </a> */}
              </div>
            </div>
            {loginError && <p style={{ color: 'red', fontSize: '14px' }}> {loginError} </p>}
            <input type="submit" className="login-btn" value={loading ? "Loading..." : "Login"} />
          </form>
        </div>
      </div>

      {/* Forgot Password: enter your email Modal */}


      {/* <Modal
        show={showForgotPasswordModal}
        // onHide={() => setShowForgotPasswordModal(false)}
        onHide={handleCloseForgotPasswordModal}
        // backdrop="static"
        centered
        // className="login-succ animate__animated animate__bounceIn login-modal-wp"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleForgotPasswordSubmit}>
            <Form.Group controlId="forgotPasswordEmail">
              <Form.Label style={{ fontSize: "18px", fontWeight: "450" }}>Enter your email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail} 
                onChange={(e) => {e.preventDefault(); setForgotPasswordEmail(e.target.value)}}
              />
            </Form.Group>
            {forgotPasswordError && (
              <div className="text-danger mt-2">{forgotPasswordError}</div>
            )}
            {forgotPasswordSuccess && (
              <div className="text-success mt-2">{forgotPasswordSuccess}</div>
            )}
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                type="submit"
                className="mt-3"
                // disabled={!forgotPasswordEmail}
                style={{ cursor: "pointer" }}
              >
                Send Otp
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal> */}


      {/* Forgot Password: enter OTP */}

      {/* <Modal
        show={showOtpModal}
        onHide={() => setShowOtpModal(false)}
        centered
        // className="login-succ animate__animated animate__bounceIn login-modal-wp"
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter Verification Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleVerifyOtp}
          >
            <Form.Label style={{ fontSize: "18px", color:"#333" }}>
              We have sent the verification code to your registered email id
            </Form.Label>
           

            <div className="d-flex justify-content-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Form.Control
                  key={i}
                  type="text"
                  maxLength="1"
                  value={otp[i]}
                  ref={(el) => (otpInputRefs.current[i] = el)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]?$/.test(val)) {
                      const newOtp = [...otp];
                      newOtp[i] = val;
                      setOtp(newOtp);
                      if (val && i < 5) otpInputRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && otp[i] === "" && i > 0) {
                      otpInputRefs.current[i - 1]?.focus();
                    }
                  }}
                  className="otp-box"
                />
              ))}
            </div>
            {otpError && <p className="text-danger text-center mt-2">{otpError}</p>}

            <div className="text-center mt-3">
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Button variant="link" onClick={() => setCountdown(120)}>
                  Resend OTP
                </Button>
              )}
            </div>
            {otpError && <div className="text-danger mt-2">{otpError}</div>}
            <div className="d-flex justify-content-center">
              <Button type="submit" variant="primary" className="mt-3" style={{ cursor: "pointer" }}>
                Verify OTP
              </Button>
            </div>
          </Form>

        </Modal.Body>
      </Modal> */}

      {/* Forgot Password: reset password modal */}

      {/* <Modal
      show={showCreatePasswordModal}
      // onHide={() => setShowCreatePasswordModal(false)}
      onHide={handleCloseCreatePasswordModal}
      centered
      // className="login-succ animate__animated animate__bounceIn login-modal-wp"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreatePassword}>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Enter new password"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Confirm new password"
              />
            </Form.Group>

            {passwordError && (
              <div className="text-danger mt-2">{passwordError}</div>
            )}

            <div className="d-flex justify-content-center">
              <Button type="submit" className="mt-3">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal> */}


      <ForgotPasswordModals
      show={showForgotPasswordModal}
      onClose={() => setShowForgotPasswordModal(false)}
      />

      <LoginSuccessModal showModal={showModal} setShowModal={setShowModal} navigate={navigate} />
    </div>
  );
};

export default Login;

const LoginSuccessModal = ({ showModal, setShowModal, navigate }) => {
  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      backdrop="static"
      centered
      className="login-succ animate__animated animate__bounceIn login-modal-wp"
    >
      <Modal.Body>
        <div className="logout-in">
          <h1>Login Successful</h1>
          <img src={success_svg} alt="Success" />
          <p>Welcome to Tagis Admin panel!</p>
          <form>
            <Button
              onClick={() => {
                setShowModal(false);
                navigate('/client-management');
              }}
              className="logout-in-btn"
            >
              Okay
            </Button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};
