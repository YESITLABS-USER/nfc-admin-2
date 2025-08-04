import React, { useEffect, useState } from "react";
import { DatePicker } from "rsuite";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllCampaignByClientId, getAllCampaignLoyality, getAllClients, getAllLocations, getLoyalityUniqueId } from "../redux/slices/loyalitySlice";
import { checkCoupanLimit, createCoupan, editCoupan } from "../redux/slices/coupanSlice";
import { convertToYYYYMMDD } from "../assets/common";
import ReactQuill from "react-quill";
import Select from 'react-select';


const CreateEditCoupan = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const isEditMode = data !== undefined;
  console.log(data)

  const dispatch = useDispatch();
  const { allClients, loyalityUniqueId, allCampaigns, client_loading, location_loading } = useSelector((state) => state.loyality);
  const { coupanLimit } = useSelector((state) => state.coupans);
  
  const [loyaltyId, setLoyaltyId] = useState("");
  
  const [clientId, setClientId] = useState(null);
  const [finalCampaignId, setFinalCampaignId] = useState("");
  const [scanType, setScanType] = useState(isEditMode ? data?.validity_start_date_from_valid_scan : 0);
  const [dobType, setDobType] = useState(isEditMode ? data?.start_date_from_dob : 0);
  // const [selectColor, setSelectColor] = useState('#000000')
  const [selectedCouponType, setSelectedCouponType] = useState("");
  const [usageLimit, setUsageLimit] = useState(isEditMode ? data?.usages_limit_no_limit == 1 ? 1 : 0 : 0);
  const [multipleUsageLimit, setMultipleUsageLimit] = useState(isEditMode ? data?.usages_limit_no_multiple == 1 ? 1 : 0 : 0);
  const [isInfinity, setIsInfinity] = useState(false);

  const [startDateLimit, setStartDateLimit] = useState(null);
  const [endDateLimit, setEndDateLimit] = useState(null);
  const [endDateContinuous, setEndDateContinuous] = useState(null);
  const [campaignCoupanLimit, setCampaignCoupanLimit] = useState(false);
  const [coupanStatus, setCoupanStatus] = useState(null);
  const [clientTableId, setClientTableId] = useState(null);
  
  useEffect(() => {
    if (coupanLimit) {
      setCampaignCoupanLimit(coupanLimit);
    }
  }, [coupanLimit]);
  
  useEffect(() => {
    dispatch(getAllClients());
    dispatch(getLoyalityUniqueId());

    if (isEditMode) {
      setClientId(data?.client_id);
      setSelectedCouponType(data?.coupon_type)
      setStartDateLimit(data?.campaign_start_date)
      setEndDateLimit(data?.campaign_end_date)
      setEndDateContinuous(data?.campaign_end_date_continuous)
      setCoupanStatus(data?.show_campaign_status)
      setClientTableId(data?.client_table_id)
      setDobType(data?.start_date_from_dob == 1)
    }
  }, [dispatch, isEditMode, data]);

  useEffect(() => {
    if (clientTableId) {
      dispatch(getAllCampaignByClientId({ client_table_id: clientTableId }));
    }
  }, [clientTableId, dispatch]);

  useEffect(() => {
    if (!isEditMode && loyalityUniqueId) {
      setLoyaltyId(loyalityUniqueId); 
    }
  }, [loyalityUniqueId, isEditMode]);
 
  const initialValues = {
    id: isEditMode ? data.id : "",
    client_id: isEditMode ? data.client_id : '',
    client_table_id : isEditMode ? data.client_table_id : '',
    client_name: isEditMode ? data.client_name : '',

    campaign_id: isEditMode ? data.campaign_id : '',
    campaign_name: isEditMode ? data.campaign_name : '',
    campaign_table_id: isEditMode ? data.campaign_table_id : "",
    status: isEditMode ? (data?.show_campaign_status == 1 ? 1 : 0) : null,

    coupon_name:  isEditMode ? data?.coupon_name :"",
    coupon_id: isEditMode ? data?.coupon_id : loyaltyId || "", // Update this line

    coupon_type:  isEditMode ? data?.coupon_type : "",
    coupon_type_content: isEditMode ? data?.coupon_type_content : [],

    usages_limit_no_multiple : isEditMode ? data?.usages_limit_no_multiple == 1 ? 1 : 0 : multipleUsageLimit ? 1 : 0,
    usages_limit_no_limit:  isEditMode ? data?.usages_limit_no_limit == 1 ? 1 : 0 : usageLimit ? 1 : 0,
    usages_limit_select_number: isEditMode ? data.usages_limit_select_number : "",
    usages_limit_select_time_unit: isEditMode ? data.usages_limit_select_time_unit : "",

    validity_start_date_from_valid_scan: isEditMode ? data.validity_start_date_from_valid_scan : 0,
    validity_select_number: isEditMode ? data.validity_select_number : "",
    validity_select_time_unit: isEditMode ? data.validity_select_time_unit : "",

    start_date_from_dob : isEditMode ? data.start_date_from_dob : 0,
    days_after_dob : isEditMode ? data.days_after_dob : 0,
    days_before_dob : isEditMode ? data.days_before_dob : 0,    

    validity_start_date: isEditMode ? data.validity_start_date : "",
    validity_expiration_date: isEditMode ? data.validity_expiration_date : "",
    validity_no_limit: isEditMode ? data.validity_no_limit ? 1 : 0 : 0,
    other_customization: isEditMode ? data.other_customization : "" ,
    color_selection: isEditMode ? data.color_selection : "",
    is_publish : isEditMode ? data.is_publish : 0,

    infinity_qty: isEditMode ? data?.infinity_qty == 1 ? 1 : 0 : 0,
    valid_scan_freq: isEditMode ? data?.valid_scan_freq : "",
    select_time_unit: isEditMode ? data?.select_time_unit : "",
    valid_scan_qty: isEditMode ? data?.valid_scan_qty : "",
  };
  
  const validationSchema = Yup.object({
    client_id: Yup.string().required("Client name is required"),
    campaign_name: Yup.string().required("Campaign name is required"),
    status: Yup.string().required("Campaign status is required"),
    coupon_name: Yup.string().required("Coupon name is required"),
    coupon_type: !selectedCouponType ? Yup.string().required("Coupon type is required") : Yup.string().notRequired(),
    
    usages_limit_select_number: (multipleUsageLimit || usageLimit) ? Yup.string().notRequired() : Yup.string().required("Usage number is required"),
    usages_limit_select_time_unit: (multipleUsageLimit || usageLimit) ? Yup.string().notRequired() : Yup.string().required("Usage time unit is required"),
    validity_start_date_from_valid_scan:  Yup.string().required("Valid date type is required"),

    other_customization: Yup.string().required("Other customization is required"),

    valid_scan_freq : Yup.number().required("frequency is required"),
    select_time_unit: Yup.string().required("Time unit is required"),
    valid_scan_qty: Yup.number().required("scan quantity is required"),
    color_selection: Yup.string().required("Color is required"),

  });


  const handleSubmit = (values) => {
    const formData = { ...values };

    // if(formData.infinity_qty == 1){
    //   formData.validity_select_number = "";
    //   formData.validity_select_time_unit = "";
    //   formData.validity_start_date_from_valid_scan = 0;
    //   formData.validity_start_date = "";
    //   formData.validity_expiration_date = "";
    //   formData.validity_no_limit = 0;
    // }
    if(dobType == "1"){
      formData.validity_select_number = "";
      formData.validity_select_time_unit = "";
      formData.validity_start_date_from_valid_scan = 0;
      formData.validity_start_date = "";
      formData.validity_expiration_date = "";
      formData.validity_no_limit = 0;
    }
    if(dobType != "1"){
      formData.days_after_dob = "";
      formData.days_before_dob = ""
    }

    if(scanType == 0) {
      formData.validity_select_number = "";
      formData.validity_select_time_unit = "";
    }
  
    if (usageLimit == 1) {
      formData.usages_limit_select_number = "";
      formData.usages_limit_select_time_unit = "";
    }
  
    // Clear expiration date if no limit is checked
    if (formData.validity_no_limit) {
      formData.validity_expiration_date = "";
    }
  
    // Add the logic to set coupon_id (if needed)
    if (!formData.coupon_id && loyaltyId) {
      formData.coupon_id = loyaltyId; // or loyalityUniqueId if that is preferred
    }

  
    // Dispatch the action to create or edit the coupon
    isEditMode ? dispatch(editCoupan(formData)) : dispatch(createCoupan(formData));
  
    // console.log("Form Values:", formData);
  };
  
    
  return (
    <main>
      <div className="dashboard-wrap">
        <div className="back-and-heading-wrap">
          <div className="back-btn">
            <a href="/coupons-management">
              <img src="/images/menu-icons/left-arrow.png" alt="" />
            </a>
          </div>
          <h1>{isEditMode ? "Edit Coupon" : "Create Coupon"}</h1>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, setFieldValue }) => {
              const handleCouponTypeChange = (e) => {
                const type = e.target.value;
                setSelectedCouponType(type);
                // Reset coupon_type_content when type changes
                setFieldValue("coupon_type", type);
                setFieldValue("coupon_type_content", []);
              };  
            return(
            <Form >
              <div className="creat-new-user-wrap">
                <div className="col-lg-12">
                <div className="row">

                {/* Client Name */}    
                  <div className="col-lg-3">
                    <label>
                      <h3>Client Name</h3>
                      <Select 
                        options={allClients.map(({ client_id, client_name }) => ({
                          value: client_id, label: `${client_name} - (${client_id})` }))}
                          value={values.client_id ? { value: values.client_id, label: `${values.client_name} - (${values.client_id})` } : null}
                          isLoading={client_loading} isDisabled={allClients.length == 0}
                          placeholder={client_loading ? "Loading..." : "Select client"}
                          noOptionsMessage={() => "No client found"}
                        onChange={({ value }) => {
                          setClientId(value);
                          const data = allClients.find((item) => item.client_id == value);
                          setClientTableId(data?.id)
                          setFieldValue("client_id", value);
                          setFieldValue("client_name", data?.client_name);
                          setFieldValue("client_table_id", data?.id);
                        }}
                      />

                      <ErrorMessage name="client_id" component="div" className="validation-error" />
                    </label>
                  </div>

                {/* Campaign Name */}
                  <div className="col-lg-3">
                    <label>
                      <h3>Campaign Name</h3>
                      <Select
                        name="campaign_name"
                        options={allCampaigns?.map(item => ({
                          value: item.campaign_table_id,
                          label: `${item.campaign_name} - (${item.camppaign_id})`
                        }))}
                        onChange={(selectedOption) => {
                          const selectedCampaignId = selectedOption.value;

                          const selectedCampaign = allCampaigns?.find(item => item.campaign_table_id == selectedCampaignId);
                          setStartDateLimit(new Date(selectedCampaign?.campaign_start_date));
                          setEndDateLimit(selectedCampaign?.campaign_end_date_continuous == 1 ? null : new Date(selectedCampaign?.campaign_end_date));
                          setEndDateContinuous(selectedCampaign?.continuous);
                          setCoupanStatus(selectedCampaign?.show_campaign_status);

                          dispatch(checkCoupanLimit({ campaign_table_id: selectedCampaign?.campaign_table_id }));

                          if (selectedCampaign) {
                            setFinalCampaignId(selectedCampaign?.camppaign_id);
                            setFieldValue("campaign_name", selectedCampaign?.campaign_name);
                            setFieldValue("campaign_id", selectedCampaign?.camppaign_id);
                            setFieldValue("campaign_table_id", selectedCampaign?.campaign_table_id);
                            setFieldValue("status", selectedCampaign?.campaign_status ? 1 : 0);
                          } else {
                            setFinalCampaignId("");
                            setFieldValue("campaign_name", "");
                            setFieldValue("campaign_table_id", "");
                            setFieldValue("campaign_id", "");
                            setFieldValue("status", null);
                          }
                        }}
                        value={ isEditMode
                            ? { value: data.campaign_table_id, label: `${data.campaign_name} - (${data.campaign_id})` }
                            : values.campaign_table_id
                            ? { value: values.campaign_table_id, label: `${values.campaign_name} - (${values.campaign_id})` }
                            : null
                        }
                        
                        placeholder="Select campaign"
                        isLoading={location_loading}
                        isDisabled={allCampaigns.length == 0}
                      />
                      <ErrorMessage name="campaign_name" component="div" className="validation-error" />
                    </label>
                  </div>

                {/* Campaign ID */}
                  <div className="col-lg-3">
                    <label>
                      <h3>Campaign ID</h3>
                      <Field
                        type="text"
                        name="campaign_id"
                        value={isEditMode ? values.campaign_id : finalCampaignId}
                        placeholder="Enter campaign ID"
                        disabled
                      />
                      <ErrorMessage name="campaign_id" component="div" className="validation-error" />
                    </label>
                  </div>

                {/* Campaign Status */}
                  <div className="col-lg-3">
                    <label>
                      <h3>Campaign Status</h3>
                      <Field
                        type="text"
                        name="status"
                        value={
                          values.status == null
                            ? "Campaign Status"
                            : coupanStatus == 1
                            ? "Active"
                            : "Deactive"
                        }
                        placeholder="Campaign Status"
                        disabled
                      />
                      <ErrorMessage name="status" component="span" className="validation-error" />
                    </label>
                  </div>
                  
                {/* Coupan Name */}
                  <div className="col-lg-3">
                    <label>
                      <h3>Coupon Name</h3>
                      <ErrorMessage name="coupon_name" component="span" className="validation-error" />
                      <Field type="text" name="coupon_name" placeholder="Enter coupon name" />
                    </label>
                  </div>
                </div>

              <div className="create-loyalty-box">
                <div>
                  <div>
                    <label style={{width:'30%'}}>
                      <h6 style={styles.h6}>Coupon Type</h6>

                      <Field as="select" name="coupon_type"
                        style={styles.select}
                        value={selectedCouponType}
                        onChange={handleCouponTypeChange}
                        onBlur={() => setFieldValue("coupon_type", selectedCouponType)}
                      >
                        <option value="">Select Coupon Type</option>
                        <option value="freeItem">Free Item</option>
                        <option value="freeItemWithPurchase">Free item with purchase</option>
                        <option value="tieredDiscount">Tiered Discount</option>
                        <option value="spendXGetY">Spend X Get Y Free</option>
                        <option value="discountPercentage">Discount %</option>
                        <option value="xForY">X for Y</option>
                        <option value="fixedAmount"> € Value (Fixed Amount) </option>
                      </Field>
                      <ErrorMessage name="coupon_type" component="div" className="validation-error" />
                    </label>


                    {selectedCouponType == "freeItem" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>Free Item</h6>
                          <input 
                            type="text" 
                            name="free_item" 
                            style={styles.input} 
                            placeholder="Enter free item" 
                            value={values.coupon_type_content[0]?.free_item || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              free_item: e.target.value
                            }])}
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "freeItemWithPurchase" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>Purchase Item</h6>
                          <input 
                            type="text" 
                            name="purchase_item"
                            value={values.coupon_type_content[0]?.purchase_item || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              purchase_item: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter purchase item" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Free Item</h6>
                          <input 
                            type="text" 
                            name="free_item"
                            value={values.coupon_type_content[0]?.free_item || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              free_item: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter free item" 
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "tieredDiscount" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>Spending Value (€)</h6>
                          <input 
                            type="text" 
                            name="spending_value"
                            value={values.coupon_type_content[0]?.spending_value || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              spending_value: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Spending Value" 
                          />
                        </label>
                        
                        <label>
                          <h6 style={styles.h6}>Numeric Discount Value</h6>
                          <input 
                            type="text" 
                            name="numeric_discount_value"
                            value={values.coupon_type_content[0]?.numeric_discount_value || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              numeric_discount_value: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Numeric Discount" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Discount Value (%)</h6>
                          <input 
                            type="text" 
                            name="discount_value"
                            value={values.coupon_type_content[0]?.discount_value || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              discount_value: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Discount Value" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Product Restrictions</h6>
                          <input 
                            type="text" 
                            name="product_restrictions"
                            value={values.coupon_type_content[0]?.product_restrictions || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              product_restrictions: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Product Restrictions" 
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "spendXGetY" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>Spend (€)</h6>
                          <input 
                            type="text" 
                            name="spend_value"
                            value={values.coupon_type_content[0]?.spend_value || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              spend_value: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Number of Spend" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Free Item</h6>
                          <input 
                            type="text" 
                            name="free_item"
                            value={values.coupon_type_content[0]?.free_item || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              free_item: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Free Item" 
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "discountPercentage" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>Discount %</h6>
                          <input 
                            type="text" 
                            name="discount_percentage"
                            value={values.coupon_type_content[0]?.discount_percentage || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              discount_percentage: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Discount %" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Product Restrictions</h6>
                          <input 
                            type="text" 
                            name="product_restrictions"
                            value={values.coupon_type_content[0]?.product_restrictions || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              product_restrictions: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Restrictions Detail" 
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "xForY" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}>X text</h6>
                          <input 
                            type="text" 
                            name="x_text"
                            value={values.coupon_type_content[0]?.x_text || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              x_text: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter X text" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}>Y text</h6>
                          <input 
                            type="text" 
                            name="y_text"
                            value={values.coupon_type_content[0]?.y_text || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content[0],
                              y_text: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Y text" 
                          />
                        </label>
                      </div>
                    )}

                    {selectedCouponType == "fixedAmount" && (
                      <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
                        <label>
                          <h6 style={styles.h6}> Enter Value (€) </h6>
                          <input 
                            type="text" 
                            name="fixedAmount_value"
                            value={values.coupon_type_content?.[0]?.fixedAmount_value || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content?.[0],
                              fixedAmount_value: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter Value" 
                          />
                        </label>
                        <label>
                          <h6 style={styles.h6}> Product Restrictions </h6>
                          <input 
                            type="text" 
                            name="fixedAmount_product_restriction"
                            value={values?.coupon_type_content?.[0]?.fixedAmount_product_restriction || ''} 
                            onChange={(e) => setFieldValue("coupon_type_content", [{
                              ...values.coupon_type_content?.[0],
                              fixedAmount_product_restriction: e.target.value
                            }])}
                            style={styles.input} 
                            placeholder="Enter restrictions" 
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Limit */}
              <div className="bottom-coupon-form-wrap">
                <div className="row">
                  <div className="usagelimit-access">
                    <div className="col-lg-2">
                      <label className="no-expariton-check">
                        <h3>Usage Limit:</h3>
                      </label>
                    </div>
                    <div className="col-lg-2">
                      <label className="no-expariton-check">
                        <input 
                          type="checkbox"
                          name="usages_limit_no_limit"
                          checked={multipleUsageLimit ? 1 : 0}
                          onChange={(e) => {setMultipleUsageLimit(e.target.checked); setFieldValue("usages_limit_no_multiple", e.target.checked ? 1 : 0)}}
                        />

                        <h3>No Multiple Coupon</h3>
                      </label>
                    </div>
                    <div className="col-lg-2">
                      <label className="no-expariton-check">
                        <input 
                          type="checkbox"
                          name="usages_limit_no_limit"
                          checked={!multipleUsageLimit && usageLimit ? 1 : 0}
                          onChange={(e) => {setUsageLimit(e.target.checked); setFieldValue("usages_limit_no_limit", e.target.checked ? 1 : 0)}}
                        />

                        {/* <h3>No limit</h3> */}
                        <h3> Infinity </h3>
                      </label>
                    </div>
                    <div className="col-lg-2">
                      <label>
                        <h3>Enter Number</h3>
                        <Field type="text" name="usages_limit_select_number" value={usageLimit ? "" : values.usages_limit_select_number} placeholder="Enter Number" disabled={usageLimit || multipleUsageLimit}/>
                        <ErrorMessage name="usages_limit_select_number" component="div" className="validation-error" />
                      </label>
                    </div>

                    <div className="col-lg-3">
                      <label>
                        <h3>Select Time Unit</h3>
                        <Field as="select" name="usages_limit_select_time_unit" disabled={usageLimit || multipleUsageLimit}>
                          <option value=""> Select Time Unit</option>
                          <option value="month"> Month </option>
                          <option value="week"> Week </option>
                          <option value="day"> Days </option>
                          <option value="hour"> Hours </option>
                          <option value="minute"> Minutes </option>
                        </Field>
                        <ErrorMessage name="usages_limit_select_time_unit" component="div" className="validation-error" />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

            {/* Frequency */}
              <div className="row" style={{ paddingTop:"40px"}}>
                <div className="col-lg-3">
                  <label>
                    <h3>Valid Scan Frequency</h3>
                    <Field type="text" name="valid_scan_freq" />
                    <ErrorMessage name="valid_scan_freq" component="div" className="error-message d-flex"
                      style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                    />
                  </label>
                </div>
  
                <div className="col-lg-3">
                  <label>
                  <h3>Select Time Unit</h3>
                  <Field as="select" name="select_time_unit" onChange={(e) => {
                    setFieldValue('select_time_unit', e.target.value);
                    }}>
                    <option value=""> Select Time Unit </option>
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                    <option value="day">Day</option>
                    <option value="hour">Hour</option>
                    <option value="minute">Minute</option>
                  </Field>
                  <ErrorMessage name="select_time_unit" component="div" className="error-message d-flex"
                    style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                  />
                  </label>
                </div>
  
                <div className="col-lg-3">
                  <label>
                    <h3>Valid Scan Qty</h3>
                    <Field type="text" name="valid_scan_qty"/>
                    <ErrorMessage name="valid_scan_qty" component="div" className="error-message d-flex"
                      style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                    />
                  </label>
                </div>

                {/* <div className="col-lg-2">
                  <label className="no-expariton-check">
                    <Field type="checkbox" name="infinity_qty" checked={isInfinity} 
                      onChange={(e)=> {
                      // setScanType(isInfinity ? 1 : 0);
                      setIsInfinity(!isInfinity);
                      setFieldValue("infinity_qty", e.target.checked ? 1 : 0);
                    }} />
                    <h3>Infinity</h3>
                  </label>
                </div> */}
              </div>

            {/* Valid Scan or GAP*/}
              <div className="bottom-coupon-form-wrap">
                <div className="col-lg-12">
                  <div className="row">
                    <div className="usagelimit-access">
                      <div className="col-lg-3">
                        <label className="no-expariton-check">
                          <Field
                            type="checkbox"
                            name="validity_start_date_from_valid_scan"
                            value={scanType}
                            disabled={dobType}
                            // disabled={isInfinity}  // Disable based on isInfinity state
                            checked={!dobType && scanType == 1}  // Corrected comparison
                            onChange={() => {
                              setScanType(scanType == 1 ? 0 : 1)
                              setFieldValue("validity_start_date_from_valid_scan", scanType == 1 ? 0 : 1);
                            }}  // Toggle scanType between 0 and 1
                          />
                          <h3>Start date from valid scan</h3>
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3>Select Number</h3>
                          <Field
                            type="text"
                            name="validity_select_number"
                            placeholder="Enter Number"
                            disabled={dobType == 1 || scanType !== 1}
                            value={scanType == 1 ? values.validity_select_number : ""}
                          />
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3>Select Time Unit</h3>
                          <Field
                            as="select"
                            name="validity_select_time_unit"
                            disabled={dobType == 1 || scanType !== 1}
                            value={scanType == 1 ? values.validity_select_time_unit : ""}
                          >
                            <option value="">Select Time Unit</option>
                            <option value="month">Month</option>
                            <option value="week">Week</option>
                            <option value="day">Days</option>
                            <option value="hour">Hours</option>
                            <option value="minute">Minutes</option>
                          </Field>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/*Birth-day Campaign*/}
              <div className="bottom-coupon-form-wrap">
                <div className="col-lg-12">
                  <div className="row">
                    <div className="usagelimit-access">
                      <div className="col-lg-3">
                        <label className="no-expariton-check">
                          <Field
                            type="checkbox"
                            name="start_date_from_dob"
                            value={dobType}
                            // disabled={isInfinity}  // Disable based on isInfinity state
                            checked={dobType == 1}  // Corrected comparison
                            onChange={() => {
                              setDobType(dobType == 1 ? 0 : 1)
                              setFieldValue("start_date_from_dob", dobType == 1 ? 0 : 1);
                            }}  // Toggle scanType between 0 and 1
                          />
                          <h3> Start date from DOB </h3>
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3> Validity Before </h3>
                          <Field
                            type="text"
                            name="days_before_dob"
                            placeholder="Enter Number"
                            // disabled={scanType !== 1 || isInfinity}
                            disabled={dobType != 1}
                            value={dobType == 1 ? values.days_before_dob : ""}
                          />
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3> Validity After </h3>
                          <Field
                            type="text"
                            name="days_after_dob"
                            placeholder="Enter Number"
                            disabled={dobType != 1}
                            value={dobType == 1 ? values.days_after_dob : ""}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Start End Date */}
              <div className="bottom-coupon-form-wrap">
                <div className="col-lg-12">
                  <div className="row">
                    <div className="usagelimit-access">
                      <label className="no-expariton-check">
                        
                        <div className="col-lg-3">
                          <label className="start-end-date">
                            <h3>Start Date</h3>
                            <DatePicker 
                              format="dd/MM/yyyy" 
                              oneTap 
                              placeholder="Enter start date"
                              // disabled={isInfinity}
                              disabled={dobType}
                              shouldDisableDate={(current) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                              
                                const startDate = new Date(startDateLimit);
                                startDate.setHours(0, 0, 0, 0);
                              
                                const endDate = endDateLimit ? new Date(endDateLimit) : null;
                                if (endDate) endDate.setHours(0, 0, 0, 0);
                              
                                // Normalize current date
                                if (current) current.setHours(0, 0, 0, 0);
                              
                                // Disable past dates (before today)
                                if (current < today) return true;
                              
                                // Disable if outside of start and end range
                                if (endDate) {
                                  return current < startDate || current > endDate;
                                }
                              
                                return current < startDate;
                              }}
                              
                              // shouldDisableDate={(current) => {
                              //   const today = new Date();
                              //   today.setHours(0,0,0,0)
                              //   const startDate = new Date(startDateLimit);
                              //   const endDate = endDateLimit ? new Date(endDateLimit) : null;
                              //   // Reset time to ensure only the date part is compared
                              //   startDate.setHours(0, 0, 0, 0); 
                              //   if (endDate) endDate.setHours(0, 0, 0, 0);
                              //   if (current) current.setHours(0, 0, 0, 0);
                                
                              //   if (endDate == null) {
                              //     if(startDate < current){
                              //       return current && current <= startDate;
                              //     }
                              //     return current && current <= startDate; // Use < to allow startDateLimit itself
                              //   } else {
                              //     // If endDateLimit is not null, check both startDateLimit and endDateLimit
                              //     return current && (current <= startDate || current >= endDate);
                              //   }
                              // }}
                                                           
                              onChange={(date) => setFieldValue("validity_start_date", convertToYYYYMMDD(date))}
                              value={values?.validity_start_date ? new Date(values?.validity_start_date) : null}
                            />  
                            <img src="/images/menu-icons/calender-icon.png" alt="" />

                          </label>
                        </div>
                        <div className="col-lg-3">
                          <label className="start-end-date">
                            <h3>Expiration Date</h3>
                            <DatePicker 
                              format="dd/MM/yyyy" 
                              oneTap 
                              placeholder="Enter expiration date"
                              // disabled={values.validity_no_limit || isInfinity}
                              disabled={dobType || values?.validity_no_limit}
                              shouldDisableDate={(current) => {
                                if (endDateLimit == null) {
                                  // If endDateLimit is null, only check the startDateLimit
                                  // return current && current <= new Date(startDateLimit);
                                  // return current && current <= new Date(values?.validity_start_date);
                                  const startDate = new Date(values?.validity_start_date);
                                  startDate.setHours(0, 0, 0, 0); // Normalize time
                                  return current && new Date(current.setHours(0, 0, 0, 0)) < startDate;
                                } else {
                                  // If endDateLimit is not null, check both startDateLimit and endDateLimit
                                  // return current && (current <= new Date(startDateLimit) || current >= new Date(endDateLimit));
                                  // return current && (current <= new Date(values?.validity_start_date) || current >= new Date(endDateLimit));
                                  const startDate = new Date(values?.validity_start_date);
                                  startDate.setHours(0, 0, 0, 0); // Normalize time
                                  return current && new Date(current.setHours(0, 0, 0, 0)) < startDate || current >= new Date(endDateLimit);
                                }
                              }}
                              onChange={(date) => setFieldValue("validity_expiration_date", convertToYYYYMMDD(date))}
                              value={values?.validity_expiration_date ? new Date(values?.validity_expiration_date) : null}
                            />  
                            <img src="/images/menu-icons/calender-icon.png" alt="" />
                          </label>
                        </div>
                        <div className="col-lg-4">
                          <label className="no-expariton-check" style={{marginLeft: "20px"}}>
                            <Field
                              type="checkbox"
                              name="validity_no_limit"
                              // disabled={isInfinity}
                              disabled={dobType}
                              onChange={(e) => {
                                setFieldValue("validity_no_limit", e.target.checked ? 1 : 0);
                              }}
                            />
                            <h3>No limit</h3>
                          </label>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bottom-coupon-form-wrap">
                <div className="col-lg-12">
                  <div className="row">
                    <div
                      className="usagelimit-access"
                      style={{alignItems: "flex-start"}}
                    >
                      <div className="col-lg-6">
                        {/* <label>
                          <h3>Other customization</h3>
                          <Field  as="textarea"  name="other_customization" placeholder="Enter other customisations " />
                          <ErrorMessage name="other_customization" component="div" className="validation-error" />
                        </label> */}

                        <h3 className="pb-1">Other customization</h3>
                          <ReactQuill theme="snow" name="other_customization" value={values.other_customization}  onChange={(e) => {setFieldValue("other_customization", e)}} />
                          <ErrorMessage name="other_customization" component="div" className="validation-error" />
                      </div>
                      <div className="col-lg-4">
                        <label>
                          <h3>Color selection</h3>
                          <div style={{display:'flex', alignItems:'center',position:"relative" }}>
                            <label>
                              <Field as="select" name="color_selection" >
                                <option value=""> Select Color </option>
                                <option value="orange"> Orange </option>
                                <option value="red"> Red </option>
                                <option value="blue"> Blue </option>
                                <option value="black"> Black </option>
                              </Field>
                              <ErrorMessage name="color_selection" component="div" className="validation-error" />

                            </label>
                          </div>
                          
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="big-modal-common-btns">
              {/* <button type="submit" style={{ backgroundColor: "transparent", color: "white" }}
                onClick={() => setFieldValue("is_publish", 0)}
                disabled={!isEditMode && !campaignCoupanLimit?.allowCouponCreate}
                >
                <a>{isEditMode ? "Update" : "Save"}</a>
              </button> */}

              {isEditMode && <button type="submit" style={{ backgroundColor: "transparent", color: "white" }}
                onClick={() => setFieldValue("is_publish", 0)}
                disabled={!isEditMode && !campaignCoupanLimit?.allowCouponCreate}
                >
                <a>{"Update"}</a>
              </button>}

              {!isEditMode && (
                <button
                type="submit"
                  style={{ backgroundColor: "transparent", color: "white" }}
                  onClick={() => setFieldValue("is_publish", 1)}
                  disabled={!campaignCoupanLimit?.allowCouponCreate}
                  // onClick={() => handleSubmit(values, true)} // Pass true to indicate "Publish"
                >
                  <a className="publish-btn">Publish</a>
                </button>
              )}
            </div>
          </div>
          </Form>
          )}}
          </Formik>
        </div>
      </div>

    </main>
  );
};

const styles = {
  h6: {
    color: "#000",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 500,
    textAlign: "left",
    marginBottom: "4px",
  },
};
export default CreateEditCoupan;
