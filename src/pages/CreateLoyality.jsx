import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { DatePicker, TimePicker } from "rsuite";
import * as Yup from "yup";
import { formatDate, formatTime } from "../assets/common";
import { useDispatch, useSelector } from "react-redux";
import { createLoyality, editLoyality, getAllCampaignByClientId, getAllCampaignLoyality, getAllClients, getAllLocations, getLoyalityUniqueId } from "../redux/slices/loyalitySlice";
import moment from "moment";
import Select from 'react-select';

const LoyaltyCardForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const isEditMode = data !== undefined;
  const dispatch = useDispatch();
  const { allClients, loyalityUniqueId, allCampaigns, client_loading, location_loading } = useSelector((state) => state.loyality);
  
  const [loyaltyId, setLoyaltyId] = useState("");
  
  const [finalCampaignId, setFinalCampaignId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [logo, setLogo ] = useState(null);
  const [endDateLimit, setEndDateLimit] = useState(null);
  const [endDateContinuous, setEndDateContinuous] = useState(null);
  const [clientTableId, setClientTableId] = useState(null);
  
  const [isInfinity, setIsInfinity] = useState(null);

  useEffect(() => {
    dispatch(getAllClients());
    dispatch(getLoyalityUniqueId());

    if (isEditMode) {
      setLogo(data?.free_item_logo ? (backendUrl+"/"+ data?.free_item_logo) : null);
      setClientTableId(data?.client_table_id)
    }
  }, [dispatch, isEditMode, data]);

  useEffect(() => {
    if (clientTableId) {
      dispatch(getAllCampaignByClientId({ client_table_id: clientTableId }));
    }
    setEndDateLimit(selectedCampaign?.campaign_end_date)
  }, [clientTableId, dispatch, selectedCampaign]);

  useEffect(() => {
    if (!isEditMode && loyalityUniqueId) {
      setLoyaltyId(loyalityUniqueId); 
    }
  }, [loyalityUniqueId, isEditMode]);

  const initialValues = {
    id: isEditMode ? data.id : '',
    client_id: isEditMode ? data.client_id : '',
    client_name: isEditMode ? data.client_name : '',
    client_table_id: isEditMode ? data.client_table_id : '',
    campaign_id: isEditMode ? data.campaign_id : '',
    campaign_name: isEditMode ? data.campaign_name : '',
    campaign_table_id: isEditMode ? data.campaign_table_id : '',
    campaign_status: isEditMode ? (data.show_campaign_status == 1 ? 1 : 0) : "",
    loyalty_card_id: isEditMode ? data.loyalty_card_id : loyaltyId,
    loyalty_card_name: isEditMode ? data.loyalty_card_name : '',
    number_of_stamps: isEditMode ? data.number_of_stamps : '',
    free_items: isEditMode ? data.free_items : '',
    // expiration_time: isEditMode ? data.expiration_time : null,
    expiration_date: isEditMode && !data.no_expiration ? formatDate(data.expiration_date) : null,
    no_expiration: isEditMode ? data.no_expiration : false,
    free_item_logo: null,
    select_time_unit: isEditMode ? data.select_time_unit : null,
    valid_scan_frequency: isEditMode ? data.valid_scan_frequency : null,

  };

  const validationSchema = Yup.object({
    client_id: Yup.string().required("Client name is required"),
    campaign_name: Yup.string().required("Campaign name is required"),
    loyalty_card_name: Yup.string().required("Loyalty card name is required"),
    number_of_stamps: Yup.number().required("Number of stamps is required"),
    free_items: Yup.string().required("Free item is required"),
    free_item_logo: !isEditMode && data?.free_item_logo == null ? Yup.mixed().required("Item Logo is required") : Yup.mixed().notRequired(),
    // expiration_time: Yup.mixed().nullable().required("Expiration time is required"),
    expiration_date: Yup.string().nullable().test("no_expiration", "Expiration Date is required", function (value) {
      const { no_expiration } = this.parent;
      return no_expiration || Yup.string().required("Expiration Date is required").isValidSync(value);
    }),
  });

  const formatDateForSubmission = (date) => {
    const [day, month, year] = date.split('/');
    return `${year}/${month}/${day}`;
  };

  const handleSubmit = (values) => {
    // console.log('Initial values:', values);
    const formattedValues = new FormData(); 
  
    Object.keys(values).forEach(key => {
      if (key === 'free_item_logo' && values[key]) {
        formattedValues.append('free_item_logo', values[key]);
      } else if (key !== 'free_item_logo') {
        formattedValues.append(key, values[key]);
      }
    });
  
    formattedValues.append('campaign_status', values.campaign_status === "Active" ? "1" : "0");
    formattedValues.append('loyalty_card_id', loyalityUniqueId);
    formattedValues.append('expiration_date', values.no_expiration ? null : (values.expiration_date ? formatDateForSubmission(values.expiration_date) : null));
    // formattedValues.append('expiration_time', values.expiration_time ? formatTime(values.expiration_time) : null);
    formattedValues.append('no_expiration', values.no_expiration ? 1 : 0);
  
    // Dispatch the action
    if (isEditMode) {
      dispatch(editLoyality(formattedValues));
    } else {
      dispatch(createLoyality(formattedValues));
    }
    
  };
  
  return (
    <main>
      <div className="dashboard-wrap">
        <div className="back-and-heading-wrap">
          <div className="back-btn">
            <a style={{ cursor: "pointer" }} onClick={() => navigate("/loyalty-cards-management")} >
              <img src="/images/menu-icons/left-arrow.png" alt="" />
            </a>
          </div>
          <h1>{isEditMode ? "Edit Loyalty Card" : "Create Loyalty Card"}</h1>

          <div className="creat-new-user-wrap">
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, setFieldValue, touched, errors }) => (
              <Form>
                <div className="col-lg-12">
                  <div className="row">
                    <div className="col-lg-3">
                      <label>
                        <h3>Client Name</h3>
                        <Select 
                          options={allClients.map((item) => ({ value: item.client_id, label: `${item.client_name} - (${item.client_id})` }))}
                          isLoading={client_loading} isDisabled={allClients?.length === 0 || isEditMode}
                          placeholder={client_loading ? "Loading..." : allClients?.length === 0 ? "No client found" : "Select client"}
                          value={values.client_id ? { value: values.client_id, label: `${values.client_name} - (${values.client_id})` } : null}
                          onChange={(selected) => { 
                            const data = allClients.find((item) => item.client_id === selected?.value);
                            setClientTableId(data?.id)
                            setFieldValue("client_id", selected?.value); 
                            setFieldValue("client_table_id", data?.id); 
                            setFieldValue("client_name", selected?.label.split(' - ')[0]); 
                          }}/>

                        <ErrorMessage name="client_id" component="div" className="validation-error" />
                      </label>
                    </div>

                    {/* Campaign Name */}
                    <div className="col-lg-3">
                      <label>
                        <h3>Campaign Name</h3>
                        <Select name="campaign_name"
                          options={allCampaigns?.map(item => ({
                            value: item.campaign_table_id,
                            label: `${item.campaign_name} - (${item.camppaign_id})`
                          }))}
                          onChange={(selectedOption) => {
                            const selectedCampaignId = selectedOption.value;
                            const selectedCampaign = allCampaigns?.find(item => item.campaign_table_id == selectedCampaignId);
                            setSelectedCampaign(selectedCampaign)
                            if (selectedCampaign) {
                              setFinalCampaignId(selectedCampaign?.camppaign_id);
                              setFieldValue("campaign_id", selectedCampaign?.camppaign_id);
                              setFieldValue("campaign_name", selectedCampaign?.campaign_name);
                              setFieldValue("campaign_table_id", selectedCampaign?.campaign_table_id);
                              setFieldValue("campaign_status", selectedCampaign?.campaign_status == 1 ? 1 : 0);
                            } else {
                              setFinalCampaignId("");
                              setFieldValue("campaign_name", "");
                              setFieldValue("campaign_table_id", "");
                              setFieldValue("campaign_id", "");
                              setFieldValue("campaign_status", null);
                            }
                          }}
                          value={
                            isEditMode
                              ? { value: data.campaign_table_id, label: `${data.campaign_name} - (${data.campaign_id})` }
                              : values.campaign_table_id
                              ? { value: values.campaign_table_id, label: `${values.campaign_name} - (${values.campaign_id})` }
                              : null
                          }
                          placeholder="Select campaign"
                          isLoading={location_loading}
                          isDisabled={allCampaigns?.length === 0 || isEditMode}
                        />
                        <ErrorMessage name="campaign_name" component="div" className="validation-error" />
                      </label>
                    </div>

                    <div className="col-lg-3">
                      <label>
                        <h3>Campaign ID</h3>
                        <Field type="text" name="campaign_id" value={isEditMode ? values.campaign_id: finalCampaignId} placeholder="Enter campaign ID" disabled/>
                        <ErrorMessage name="campaign_id" component="div" className="validation-error" />
                      </label>
                    </div>
                    
                    <div className="col-lg-3">
                      <label>
                        <h3>Campaign Status</h3>
                        <Field type="text" name="campaign_status" disabled placeholder="Campaign Status"
                           value={values?.campaign_status == "1" ? "Active" : values?.campaign_status == "0" 
                            ? "Deactive" : "Campaign Status"} 
                          style={{ backgroundColor: "rgb(217, 217, 217)", color: "#2A0181", fontWeight: "bold"}}
                        />
                      <ErrorMessage name="campaign_status" component="div" className="validation-error" />  
                      </label>
                    </div>
                    
                    <div className="col-lg-3">
                      <label>
                        <h3>Loyalty Card ID</h3>
                        <Field type="text" name="loyalty_card_id" value={isEditMode? values.loyalty_card_id : loyaltyId} placeholder= "Enter coupon ID" disabled/>
                        <ErrorMessage name="loyalty_card_id" component="div" className="validation-error" />
                      </label>
                    </div>
                    <div className="col-lg-3">
                      <label>
                        <h3>Loyalty Card Name</h3>
                        <Field type="text" name="loyalty_card_name" placeholder="Enter coupon name" disabled={isEditMode}/>
                        <ErrorMessage name="loyalty_card_name" component="div" className="validation-error" />
                      </label>
                    </div>

                    <div className="create-loyalty-box">
                      <div className="row">
                        <div className="col-lg-4">
                          <label>
                            <h3>Number of stamps</h3>
                            <Field type="text" name="number_of_stamps" placeholder="Enter number of stamps"  disabled={isEditMode}/>
                            <ErrorMessage name="number_of_stamps" component="div" className="validation-error" />
                          </label>
                        </div>
                        <div className="col-lg-4">
                          <label>
                            <h3>Free Item</h3>
                            <Field type="text" name="free_items" placeholder="Enter Free Item" />
                            <ErrorMessage name="free_items" component="div" className="validation-error" />
                          </label>
                        </div>
                        <div className="col-lg-4">
                          <div className="custom-file-upload2">
                            <label htmlFor="master_file"> Free item logo</label>
                            <input type="file" id="master_file"  name="free_item_logo"  style={{ display: "none" }}
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files[0];
                                setLogo(URL.createObjectURL(file));
                                setFieldValue("free_item_logo", file);
                              }}
                          />
                            <img src={ logo || "/images/menu-icons/company-uploadlogo.png"} className="upl_img"  style={{ width:'32px', height:"32px"}}/>
                          </div>
                          <ErrorMessage name="free_item_logo" component="div" className="validation-error" />
                        </div>

                         {/* Frequency */}
                        <div className="row">
                          <div className="col-lg-4">
                            <label>
                              <h3>Valid Scan Frequency</h3>
                              <Field type="text" name="valid_scan_frequency" onChange={ (e) => setFieldValue("valid_scan_frequency", e.target.value )}  disabled={isEditMode}/>
                              <ErrorMessage name="valid_scan_frequency" component="div" className="error-message d-flex"
                                style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                              />
                            </label>
                          </div>

                          <div className="col-lg-4">
                            <label>
                            <h3>Select Time Unit</h3>
                            <Field as="select" name="select_time_unit"  disabled={isEditMode} onChange={(e) => {
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
                        </div>
                        
                        <div className="col-lg-4">
                          <label htmlFor="" className="start-end-date">
                            <h3>Expiration Date</h3>
                            <DatePicker format="dd/MM/yyyy" oneTap placeholder="Enter expiration date" 
                              shouldDisableDate={(current) => {
                                const today = new Date().setHours(0, 0, 0, 0); // Set to midnight for a full day comparison
                                if (endDateContinuous === true || endDateLimit === null) {
                                  return current < today;
                                } else {
                                  return current < today || current >= new Date(endDateLimit).setHours(23, 59, 59, 59);
                                }
                              }}
                              value={values.expiration_date ? new Date(values.expiration_date.split('/').reverse().join('/')) : null}
                              onChange={(date) => setFieldValue("expiration_date", formatDate(date))}
                              disabled={values.no_expiration}
                            />  
                            <img src="/images/menu-icons/calender-icon.png" alt="" />
                            {touched.expiration_date && errors.expiration_date && (
                          <div className="validation-error">{errors.expiration_date}</div> )}
                          </label>
                        </div>

                        <div className="col-lg-4">
                          <label htmlFor="" className="no-expariton-check">
                            <Field type="checkbox" name="no_expiration" 
                              disabled={endDateLimit}
                              onChange={(e) => {
                              const checked = e.target.checked;
                              setFieldValue("no_expiration", checked);
                              setFieldValue("expiration_date", checked ? null : values.expiration_date);
                            }}/>
                            <h3>No Expiration</h3>
                          </label>
                          {touched.expiration_date && errors.expiration_date && (<p className="validation-error"> </p> )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="big-modal-common-btns">
                  <button type="submit"><a style={{color:'white'}}> {isEditMode ? "Update" : "Save"}</a></button>
                </div>
              </Form>
            )}
            </Formik>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoyaltyCardForm;
