import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPassword, resetPassword, verifyForgotPasswordOtp } from '../redux/slices/adminSlice';

const ForgotPasswordModals = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const { forgotPass, forgotPassloading, verifyForgotPasswordOtpLoading, verifyForgotOtp, resetPasswordLoading, resetPasswordData } = useSelector((state) => state.admin)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(true);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const otpInputRefs = useRef([]);

  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);


  //eye toggle
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (showOtpModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtpModal, countdown]);

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    console.log("email@@@@@", forgotPasswordEmail);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast.error("Invalid email");
      return;
    }

    const res = await dispatch(forgotPassword({ email: forgotPasswordEmail }));
    console.log("res@@@", res);
    console.log(res.payload?.status);
    if (res?.payload?.status == "success") {
      setShowForgotPasswordModal(false);
      setShowOtpModal(true);
      setCountdown(60);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.some((digit) => digit === "")) {
      return toast.error("Please enter the OTP");
    };

    try {
      const res = await dispatch(verifyForgotPasswordOtp({ email: forgotPasswordEmail, otp: otp.join("") }));

      if (res?.payload?.status === "success") {
        setShowOtpModal(false);
        setShowCreatePasswordModal(true);
      }
    } catch (error) {
      console.error("An error occured.")
    }

    // console.log("otp@@@@@", otp);
    // const enteredOtp = otp.join("");
    // if (enteredOtp === "123456") {
    //   alert("OTP Verified!");
    //   setShowOtpModal(false);
    //   setShowCreatePasswordModal(true);

    // } else {
    //   setOtpError("Invalid OTP. Please try again.");
    // }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    console.log("Password@@@@@", newPassword);
    console.log("ConfirmPassword@@@@@", confirmPassword);

    // 1. Validate password strength
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
    if (!passRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number or special character."
      );
      return;
    }

    if (!newPassword.trim()) {
      // toast.error("Please enter the new password")
      setPasswordError("Please enter the new password.");
    }
    if (!confirmPassword.trim()) {
      // toast.error("Please enter the confirm password")
      setPasswordError("Please enter the confirm password.");
    }
    // if (!newPassword || !confirmPassword) {
    //   setPasswordError("Please fill both fields.");
    //   return;
    // }

    if (newPassword !== confirmPassword) {
      setPasswordError("Password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await dispatch(resetPassword({ email: forgotPasswordEmail, password: newPassword }));

      if (res.payload?.status === "success") {
        setShowCreatePasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        onClose();
        toast.success("Password reset successfully!")
      }
    } catch (error) {
      toast.error("An error occured  during password reset.")
    }


    // alert("Password reset successful!");
    // setShowCreatePasswordModal(false);
    // setNewPassword("");
    // setConfirmPassword("");
    // onClose();
  };


  return (
    <>
      <Modal
        show={show && showForgotPasswordModal}
        onHide={onClose}
        centered
      // className="login-succ animate__animated animate__bounceIn login-modal-wp"
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleForgotPasswordSubmit}>
            <Form.Group controlId="forgotPasswordEmail">
              <Form.Label style={{ fontSize: "18px", fontWeight: "450" }}>
                Enter your email address
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </Form.Group>
            {forgotPasswordError && <div className="text-danger mt-2">{forgotPasswordError}</div>}
            {forgotPasswordSuccess && <div className="text-success mt-2">{forgotPasswordSuccess}</div>}
            <div className="d-flex justify-content-center">
              <Button type="submit" className="mt-3">
                {forgotPassloading ? "Submittimg..." : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showOtpModal}
        onHide={() => setShowOtpModal(false)}
        centered
      // className="login-succ animate__animated animate__bounceIn login-modal-wp"
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter Verification Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleVerifyOtp}>
            <Form.Label style={{ fontSize: "18px", color: "#999" }}>
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
                // <Button variant="link" onClick={() => setCountdown(5)}>
                <Button variant="link" onClick={handleForgotPasswordSubmit}>
                  Resend OTP
                </Button>
              )}
            </div>
            <div className="d-flex justify-content-center">
              <Button type="submit" variant="primary" className="mt-3">
                Verify OTP
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showCreatePasswordModal}
        onHide={() => setShowCreatePasswordModal(false)}
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
              <div className="position-relative">
                <Form.Control
                  type={newPasswordVisible ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Enter new password"
                />
                <i
                  className={`fas ${newPasswordVisible ? "fa-eye" : "fa-eye-slash"}`}
                  onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999" }}
                ></i>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <div className='position-relative'>
                <Form.Control
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Confirm new password"
                />
                <i
                  className={`fas ${confirmPasswordVisible ? "fa-eye" : "fa-eye-slash"}`}
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999" }}
                ></i>
              </div>
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
      </Modal>
    </>
  )
}

export default ForgotPasswordModals;