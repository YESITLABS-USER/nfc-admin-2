import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import { renderChildren } from 'rsuite/esm/InlineEdit/renderChildren';
import { forgotPassword, getOldemail, newEmailOtp, verifyForgotPasswordOtp, verifyNewEmailOtp } from '../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";

const EditEmailModal = ({ showEmailModal, setShowEmailModal }) => {
  const dispatch = useDispatch();
  const { getOldemailloading, getOldemailData, forgotPass, forgotPassloading, newEmailOtpLoading, newEmailOtpData, verifyForgotPasswordOtpLoading, verifyForgotOtp, verifyNewEmailOtpLoading, verifyNewEmailOtpData } = useSelector((state) => state.admin)
  const [currentEmail, setCurrentEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showNewEmailModal, setShowNewEmailModal] = useState(false);
  const [showNewEmailOtpModal, setShowNewEmailOtpModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [id, setId] = useState();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(null);
  const otpInputRefs = useRef([]);

  const [newEmail, setNewEmail] = useState("");
  const [newOtp, setNewOtp] = useState(["", "", "", "", "", ""]);
  const [newOtpError, setNewOtpError] = useState(null);
  const newOtpInputRefs = useRef([]);

  // useEffect(() => {
  //   const storedAdmin = localStorage.getItem("nfc-admin");
  //   if (storedAdmin) {
  //     const parsed = JSON.parse(storedAdmin);
  //     setCurrentEmail(parsed.email || "ajayMohan@gmail.com")
  //   }
  // })

  useEffect(() => {
    if ((showOtpModal && countdown > 0) || (showNewEmailOtpModal && countdown > 0)){
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtpModal, showNewEmailOtpModal, countdown]);

  const fetchEmail = async () => {
    const storedAdmin = localStorage.getItem("nfc-admin");
    if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      const id = parsed.id;
      // console.log("id@@@@@@@@@", id);
      setId(id);

      const res = await dispatch(getOldemail({ id: id }));
      // console.log("res$$$$$$$$$$", res);
      // console.log("email1111111111", res?.payload?.email);
      // console.log("email2222222222", res?.payload?.data?.email);

      if (res?.payload?.data?.email) {
        setCurrentEmail(res?.payload?.data?.email)
      }
    }
  };

  useEffect(() => {
    fetchEmail(); // call the async function
  }, [dispatch]);

  // useEffect(async () => {
  //   const storedAdmin = localStorage.getItem("nfc-admin");
  //   if (storedAdmin) {
  //     const parsed = JSON.parse(storedAdmin);
  //     const id = parsed.id;
  //     console.log("id@@@@@@@@@", id);
  //     const res = await dispatch(getOldemail({id:id}));
  //     console.log("res$$$$$$$$$$", res);
  //     // if (res?.payload?.email){
  //     //   setCurrentEmail(res?.payload?.email)
  //     // }
  //   }
  //   // const res = dispatch(getOldemail({id:id}));
  //   // if (res?.payload?.email){
  //   //   setCurrentEmail(res?.payload?.email)
  //   // }
  // }, [dispatch])

  const sendOtpToOldEmail = async () => {

    const res = await dispatch(forgotPassword({ email: currentEmail }));
    if (res?.payload?.status === "success") {
      setShowEmailModal(false);
      setShowOtpModal(true);
      setCountdown(60);
    }

    // setShowEmailModal(false);
    // setShowOtpModal(true);
    
  };

  const verifyOldOtp = async (e) => {
    e.preventDefault();

    if (otp.some((digit) => digit === "")) {
      return toast.error("Please enter the OTP");
    };

    try {
      const res = await dispatch(verifyForgotPasswordOtp({ email: currentEmail, otp: otp.join("") }));
      if (res?.payload?.status === "success") {
        setShowOtpModal(false);
        setShowNewEmailModal(true);
      }
      //  else {
      //   setOtpError("Invalid OTP")
      // }
    } catch (error) {
      console.error("An error occured.")
    }



    // if (otp.join("") === "123456"){
    //   setShowOtpModal(false);
    //   setShowNewEmailModal(true);
    // } else {
    //   setOtpError("Invalid OTP")
    // }
  };

  const sendOtpToNewEmail = async (e) => {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Please enter your email address");
      return
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Invalid email");
      return;
    }

    const res = await dispatch(newEmailOtp({ email: newEmail }));
    // console.log("res999999999",)
    if (res?.payload?.status) {
      setShowNewEmailModal(false);
      setShowNewEmailOtpModal(true);
      // setNewEmail("");
      setCountdown(60);
    }
  };

  const verifyNewEmailOtpfunc = async (e) => {
    console.log("....hello.......");
    e.preventDefault();

    if (newOtp.some((digit)=> digit === "")) {
      return toast.error("Please enter the OTP");
    };

        try{
        const res = await dispatch (verifyNewEmailOtp({email: newEmail,id:id, otp:newOtp.join("")}));
    // console.log("res0000", res);
    // console.log("res000000002222222", res?.payload?.message);
    // console.log("res000000033333333", res?.payload?.data?.message);
    // console.log("res000000444444444", res?.payload?.data?.message);
    // console.log("res000000444444444", res?.payload?.data?.status);
        if (res?.payload?.data?.status) {
          // console.log("res0000", res);
          // console.log("res000000002222222", res?.payload?.message);
          // console.log("res000000033333333", res?.payload?.data?.message);
          // console.log("res000000444444444", res?.payload?.status);
          // console.log("res000000444444444", res?.payload?.data?.status);
          setShowNewEmailOtpModal(false);
          toast.success(res?.payload?.message);
          setNewOtp(["", "", "", "", "", ""]);
          setOtp(["", "", "", "", "", ""]);
          console.log("@@@@@@@@@@@@",currentEmail);
          console.log("$$$$$$$$$$$$$",newEmail);
          setCurrentEmail(newEmail);
          await fetchEmail();
          setNewEmail("");
          
        }
      } catch (error) {
        setNewOtpError("Invalid OTP");
        console.error("An error occured.");
      }


  };

  const renderOtpInputs = (otpArray, setOtpArray, refs, error) => (
    <>
      <div className='d-flex justify-content-center gap-2'>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Form.Control
            key={i}
            type="text"
            maxLength={1}
            value={otpArray[i]}
            ref={(el) => (refs.current[i] = el)}
            onChange={(e) => {
              const val = e.target.value;
              if (/^[0-9]?$/.test(val)) {
                const updatedOtp = [...otpArray];
                updatedOtp[i] = val;
                setOtpArray(updatedOtp);
                if (val && i < 5) refs.current[i + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && otpArray[i] === "" && i > 0) {
                refs.current[i - 1]?.focus();
              }
            }}
            className='otp-box'
          />
        ))}
      </div>
      {error && <p className='text-danger text-center mt-2'>{error}</p>}
    </>
  )


  return (
    <>
      {/* Modal 1: Current Email Display */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Current Email</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <p style={{ fontSize: "16px" }}>{currentEmail}</p>
          <Button variant="primary" onClick={sendOtpToOldEmail}>{forgotPassloading ? "Edit..." : "Edit"}</Button>
        </Modal.Body>
      </Modal>

      {/* Modal 2: OTP Verification (Old Email) */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px" }}>Verify OTP sent to "{currentEmail}"</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={verifyOldOtp}>
            {renderOtpInputs(otp, setOtp, otpInputRefs, otpError)}
            <div className='text-center mt-3'>
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Button variant="link" onClick={sendOtpToOldEmail}>{forgotPassloading ? "Resending..." : "Resend OTP"} </Button>
              )}
            </div>
            <div className='d-flex justify-content-center'>
              <Button type="submit" className='mt-3'>
                {verifyForgotPasswordOtpLoading ? "Verifying.." : "Verify"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal 3: Enter New Email */}
      <Modal show={showNewEmailModal} onHide={() => setShowNewEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter New Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={sendOtpToNewEmail}>
            <Form.Group>
              <Form.Control
                type="email"
                placeholder="Enter New Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />

            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button type="submit" className='mt-3'>
                {newEmailOtpLoading ? "Sending OTP..." : "Send OTP"}</Button>
            </div>
          </Form>

        </Modal.Body>
      </Modal>

      {/* Modal 4: Verify OTP (New Email) */}
      <Modal show={showNewEmailOtpModal} onHide={() => setShowNewEmailOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "20px" }}>
            Verify OTP sent to "{newEmail}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={verifyNewEmailOtpfunc}>
            {renderOtpInputs(newOtp, setNewOtp, newOtpInputRefs, newOtpError)}
            <div className='text-center mt-3'>
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Button variant="link" onClick={sendOtpToNewEmail}>{newEmailOtpLoading ? "Resending..." : "Resend OTP"}</Button>
              )}
            </div>
            <div className='d-flex justify-content-center'>
              <Button type="submit" className='mt-3'>
                {verifyNewEmailOtpLoading ? "Verifying..." : "Verify"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )



}

export default EditEmailModal



// import React, { useEffect, useRef, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";

// const EditEmailModal = ({ showEmailModal, setShowEmailModal }) => {
//   const [currentEmail, setCurrentEmail] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [showNewEmailModal, setShowNewEmailModal] = useState(false);
//   const [showNewEmailOtpModal, setShowNewEmailOtpModal] = useState(false);

//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [otpError, setOtpError] = useState(null);
//   const otpInputRefs = useRef([]);

//   const [newEmail, setNewEmail] = useState("");
//   const [newOtp, setNewOtp] = useState(["", "", "", ""]);
//   const [newOtpError, setNewOtpError] = useState(null);
//   const newOtpInputRefs = useRef([]);

//   useEffect(() => {
//     const storedAdmin = localStorage.getItem("nfc-admin");
//     if (storedAdmin) {
//       const parsed = JSON.parse(storedAdmin);
//       setCurrentEmail(parsed.email);
//     }
//   }, []);

//   const sendOtpToOldEmail = () => {
//     // Simulate OTP sent
//     setShowEmailModal(false);
//     setShowOtpModal(true);
//   };

//   const verifyOldOtp = (e) => {
//     e.preventDefault();
//     if (otp.join("") === "1234") {
//       setShowOtpModal(false);
//       setShowNewEmailModal(true);
//     } else {
//       setOtpError("Invalid OTP");
//     }
//   };

//   const sendOtpToNewEmail = (e) => {
//     e.preventDefault();
//     if (!newEmail) return;
//     // Simulate OTP sent to new email
//     setShowNewEmailModal(false);
//     setShowNewEmailOtpModal(true);
//   };

//   const verifyNewEmailOtp = (e) => {
//     e.preventDefault();
//     if (newOtp.join("") === "5678") {
//       alert("Email successfully changed!");
//       setShowNewEmailOtpModal(false);
//       // update localStorage
//       const admin = JSON.parse(localStorage.getItem("nfc-admin"));
//       localStorage.setItem(
//         "nfc-admin",
//         JSON.stringify({ ...admin, email: newEmail })
//       );
//       setCurrentEmail(newEmail);
//     } else {
//       setNewOtpError("Invalid OTP");
//     }
//   };

//   const renderOtpInputs = (otpArray, setOtpArray, refs, error) => (
//     <>
//       <div className="d-flex justify-content-center gap-2">
//         {[0, 1, 2, 3].map((i) => (
//           <Form.Control
//             key={i}
//             type="text"
//             maxLength="1"
//             value={otpArray[i]}
//             ref={(el) => (refs.current[i] = el)}
//             onChange={(e) => {
//               const val = e.target.value;
//               if (/^[0-9]?$/.test(val)) {
//                 const updatedOtp = [...otpArray];
//                 updatedOtp[i] = val;
//                 setOtpArray(updatedOtp);
//                 if (val && i < 3) refs.current[i + 1]?.focus();
//               }
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Backspace" && otpArray[i] === "" && i > 0) {
//                 refs.current[i - 1]?.focus();
//               }
//             }}
//             className="otp-box"
//           />
//         ))}
//       </div>
//       {error && <p className="text-danger text-center mt-2">{error}</p>}
//     </>
//   );

//   return (
//     <>
//       {/* Modal 1: Current Email Display */}
//       <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Your Current Email</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="text-center">
//           <p style={{ fontSize: "16px" }}>{currentEmail}</p>
//           <Button variant="primary" onClick={sendOtpToOldEmail}>Edit</Button>
//         </Modal.Body>
//       </Modal>

//       {/* Modal 2: OTP Verification (Old Email) */}
//       <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Verify OTP sent to {currentEmail}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={verifyOldOtp}>{renderOtpInputs(otp, setOtp, otpInputRefs, otpError)}
//             <div className="d-flex justify-content-center">
//               <Button type="submit" className="mt-3">Verify</Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* Modal 3: Enter New Email */}
//       <Modal show={showNewEmailModal} onHide={() => setShowNewEmailModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Enter New Email</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={sendOtpToNewEmail}>
//             <Form.Group>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter new email"
//                 value={newEmail}
//                 onChange={(e) => setNewEmail(e.target.value)}
//               />
//             </Form.Group>
//             <div className="d-flex justify-content-center">
//               <Button type="submit" className="mt-3">Send OTP</Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* Modal 4: Verify OTP (New Email) */}
//       <Modal show={showNewEmailOtpModal} onHide={() => setShowNewEmailOtpModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Verify OTP sent to {newEmail}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={verifyNewEmailOtp}>{renderOtpInputs(newOtp, setNewOtp, newOtpInputRefs, newOtpError)}
//             <div className="d-flex justify-content-center">
//               <Button type="submit" className="mt-3">Verify</Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default EditEmailModal;