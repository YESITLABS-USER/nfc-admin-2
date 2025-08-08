import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../Api.js";
import { toast } from "react-toastify";

// Utility to check if we're in the browser environment
const isBrowser = typeof window !== "undefined";

// Login async thunk
export const login = createAsyncThunk("admin/login", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.login(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// Logout action
export const logout = createAsyncThunk("admin/logout", async (id) => {
  try {
    const response = await api.logout(id);
    return {
      message: response.data.message,
      status: response.status,
    };
  } catch (error) {
    throw error;
  }
});

//Forgot Password: sent otp on email Api
export const forgotPassword = createAsyncThunk("admin/forgotPassword", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.forgotPassword(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

//Forgot Password: verify otp Api
export const verifyForgotPasswordOtp = createAsyncThunk("admin/verifyForgotPasswordOtp", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.verifyForgotPasswordOtp(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

//Forgot Password: Reset password Api
export const resetPassword = createAsyncThunk("admin/resetPassword", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.resetPassword(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
})

//get old email to use in email changed apis
export const getOldemail = createAsyncThunk("admin/getOldemail", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.getOldemail(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
})

//email changed apis

export const newEmailOtp = createAsyncThunk("end-point", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.newEmailOtp(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
})

//Forgot Password: verifyNewEmailOtpData
export const verifyNewEmailOtp = createAsyncThunk("admin/verifyNewEmailOtp", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.verifyNewEmailOtp(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});


const authSlice = createSlice({
  name: "auth",
  initialState: {
    admin: null,
    loading: false,
    userLogedOut: isBrowser ? !localStorage.getItem("nfc-admin") : true,
    error: null,
    message: null,
    forgotPassloading: false,
    forgotPass: [],
    verifyForgotPasswordOtpLoading: false,
    verifyForgotOtp: [],
    resetPasswordLoading: false,
    resetPasswordData: [],
    getOldemailloading: false,
    getOldemailData: [],
    newEmailOtpLoading: false,
    newEmailOtpData: [],
    verifyNewEmailOtpLoading: false,
    verifyNewEmailOtpData: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login slice
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userLogedOut = false;
        state.admin = action.payload;
        if (typeof window !== "undefined") {
          const { id, token } = action.payload.data;
          localStorage.setItem("nfc-admin", JSON.stringify({ id, token }));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Logout slice
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.admin = null;
        state.userLogedOut = true;
        state.loading = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("nfc-admin");
        }
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.admin = null;
        state.error = null;
        state.userLogedOut = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem("nfc-admin");
        }
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      })


      // 3.forgot-password API extraReducer
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPassloading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPassloading = false;
        state.forgotPass = action.payload;
        state.error = null;

      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPassloading = false;
        toast.error(action?.payload?.message)
      })

      //Forgot Password: verify otp Api
      .addCase(verifyForgotPasswordOtp.pending, (state) => {
        state.verifyForgotPasswordOtpLoading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOtp.fulfilled, (state, action) => {
        state.verifyForgotPasswordOtpLoading = false;
        state.verifyForgotOtp = action.payload;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOtp.rejected, (state, action) => {
        state.verifyForgotPasswordOtpLoading = false;
        toast.error(action?.payload?.message || "Failed to verify")
        state.error = action.payload?.message || "Failed to verify";
      })
      //Forgot Password: Reset password Api
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordData = action.payload;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        toast.error(action?.payload?.message || "Failed to reset Password")
      })
      //get old email to use in email changed apis
      .addCase(getOldemail.pending, (state) => {
        state.getOldemailloading = true;
        state.error = null;
      })
      .addCase(getOldemail.fulfilled, (state, action) => {
        state.getOldemailloading = false;
        state.getOldemailData = action.payload;
        state.error = null;
      })
      .addCase(getOldemail.rejected, (state, action) => {
        state.getOldemailloading = false;
      })
      //email changed apis
      .addCase(newEmailOtp.pending, (state) => {
        state.newEmailOtpLoading = true;
        state.error = null;
      })
      .addCase(newEmailOtp.fulfilled, (state, action) => {
        state.newEmailOtpLoading = false;
        state.newEmailOtpData = action.payload;
        state.error = null;

      })
      .addCase(newEmailOtp.rejected, (state, action) => {
        state.newEmailOtpLoading = false;
        toast.error(action?.payload?.message)
      })
      //Forgot Password: verifyNewEmailOtp Api
      .addCase(verifyNewEmailOtp.pending, (state) => {
        state.verifyNewEmailOtpLoading = true;
        state.error = null;
      })
      .addCase(verifyNewEmailOtp.fulfilled, (state, action) => {
        state.verifyNewEmailOtpLoading = false;
        state.verifyNewEmailOtpData = action.payload;
        state.error = null;
      })
      .addCase(verifyNewEmailOtp.rejected, (state, action) => {
        state.verifyNewEmailOtpLoading = false;
        toast.error(action?.payload?.message || "Failed to verify")
      })

  },
});

export default authSlice.reducer;