import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { DatePicker } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { createCampaign, createCampaignTemplate, editCampaign, getAllCampaignTemplate, getAllClients, getAllLocationCampaignId, getAllLocations, getCampaignId, getNfcTagsForClient } from "../redux/slices/campaignSlice";
import * as Yup from "yup";
import { convertToYYYYMMDD } from "../assets/common";
import { useLocation } from "react-router-dom";
import Select from 'react-select';

const CreateEditCampaign = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const { data } = location.state || {};
  const isEditMode = data !== undefined;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // templete

  const [templateClientId, setTemplateClientId] = useState("");
  
  const [nfcTags, setNfcTags] = useState([]);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [coupons, setCoupons] = useState("");
  const [isContinous, setIsContinous] = useState(false);
  // const [isInfinity, setIsInfinity] = useState(false);

  const { allClients,allCampaignTemplates, uniqueCampaignId,  allClientLocation, client_loading, location_loading, nfcTagsClient, locationByCampaignId } = useSelector((state) => state.campaign);
  const [clientId, setClientId] = useState(null);
  const [clientTableId, setClientTableId] = useState(null);
  const [campaignPhoto, setCampaignPhoto] = useState(null);
  const [currentCampaignId, setCurrentCampaignId] = useState(null);

  useEffect(() => {
    dispatch(getAllClients());
    dispatch(getAllCampaignTemplate());
    dispatch(getCampaignId());

    if (isEditMode) {
      setClientId(data?.client_id);
      setCurrentCampaignId(data?.id)
      setClientTableId(locationByCampaignId.map(item => item?.client_table_id));
    }
  }, [dispatch, isEditMode,locationByCampaignId, data]);

  useEffect(() => {
    if(currentCampaignId){
      dispatch(getAllLocationCampaignId({campaign_table_id: currentCampaignId}))
    }
  },[currentCampaignId])
  
  useEffect(() => {
    if (clientId) {
      dispatch(getAllLocations({ client_id: clientId }));
    }
  }, [clientId, dispatch]);

  useEffect(() => {
    if (clientId && clientTableId) {
      dispatch(getNfcTagsForClient({ client_id: clientId, client_table_id: clientTableId }));
    }
    if(data?.campaign_photo) {
      setCampaignPhoto(data?.campaign_photo ? (backendUrl+"/"+data?.campaign_photo) : null);
    }
  }, [clientId, clientTableId, dispatch]);
  
  useEffect(() => {
    if (nfcTagsClient) {
      setNfcTags(nfcTagsClient);
    }
  }, [nfcTagsClient]);

  useEffect(() => {
    if (data) {
      setIsUnlimited(data?.amount_of_coupon_unlimented == "1");
      setIsContinous(data?.continuous == 1);
    }
  }, [isEditMode, data]);

  const handleCheckboxChange = () => {
    setIsUnlimited(!isUnlimited);
    if (!isUnlimited) {
      setCoupons(""); // Clear the field when checkbox is checked
    }
  };
  const handlecontinuousCheckboxChange = () => {
    setIsContinous(!isContinous);
  }

  const initialValues = {
    id: isEditMode && data?.id,
    client_id: isEditMode ? data.client_id :"",
    client_table_id: isEditMode ? data?.client_table_id : "",
    client_name: isEditMode ? data?.client_name : "",
    client_location: isEditMode ? data?.client_location : "",
    campaign_name: isEditMode ? data?.campaign_name : "",
    campaign_id: isEditMode ? data?.campaign_id : "",
    client_target_user_group_new_user: isEditMode ? data?.client_target_user_group_new_user == 1 ? 1: 0 :  0,
    client_target_user_group_current_user: isEditMode ? data?.client_target_user_group_current_user == 1 ? 1: 0 :  0,
    client_target_user_group_first_time_new_user: isEditMode ? data?.client_target_user_group_first_time_new_user == 1 ? 1: 0 :  0,
    amount_of_coupons_num_of_coupons: isEditMode ? data?.amount_of_coupon :  "",
    amount_of_coupons_amount_of_coupon_unlimented: isEditMode ? data?.amount_of_coupon_unlimented :  0,
    age_restriction: isEditMode ? data?.age_restriction ? (data?.age_restriction.includes("-500") ? data?.age_restriction.replace("-500", "") : "custom") : "" : "",
    customAgeFrom: isEditMode && data?.age_restriction && !data?.age_restriction.includes("-500")? data?.age_restriction.split("-")[0] : "",
    customAgeTo: isEditMode && data?.age_restriction && !data?.age_restriction.includes("-500") ? data?.age_restriction.split("-")[1] : "",
    campaign_photo: null,
    campaign_start_date: isEditMode ? data?.campaign_start_date : "",
    campaign_end_date: isEditMode ? data?.campaign_end_date : "",
    campaign_end_date_continuous: isEditMode ? data?.continuous == 1 ? 1 : 0 :  0,
    campaign_term_and_condition: isEditMode ? data?.campaign_term_and_condition : "",
    location_id: isEditMode ? locationByCampaignId.map(item => item.client_table_id) : [],
    target_nfc_tags_ids: isEditMode ? (data?.target_nfc_tags_ids ?? []) : [],
  };

  const validationSchema = Yup.object({
    client_id: Yup.string().required("Client id is required"),
    // client_table_id: Yup.string().required("Client location is required"),
    location_id: Yup.array().min(1, "Client location is required").required("Client location is required"),
    campaign_name: Yup.string().required("Campaign name is required"),
    // valid_scan_freq : Yup.number().required("frequency is required"),
    // select_time_unit: Yup.string().required("Time unit is required"),
    // valid_scan_qty: isInfinity ? Yup.mixed().notRequired() : Yup.number().required("scan quantity is required"),
    amount_of_coupons_num_of_coupons : isUnlimited ? Yup.mixed().notRequired() : Yup.number().required("Coupon number is required"),
    campaign_photo: isEditMode ? Yup.mixed().nullable() : Yup.mixed().required("Campaign photo is required"),
    age_restriction : Yup.string().required("Age restriction is required"),
    campaign_start_date : Yup.string().required("Start date is required"),
    campaign_end_date : (isContinous )? Yup.mixed().notRequired() : Yup.string().required("End date is required"),
    campaign_term_and_condition: Yup.string().required("Campaign description is required"),
  })

  const handleSubmit = (values) => {
    if (values.age_restriction == "custom") {
      values.age_restriction = `${values.customAgeFrom}-${values.customAgeTo}`;
    }
      if (values.amount_of_coupons_amount_of_coupon_unlimented == 1) {
        values.amount_of_coupons_num_of_coupons = "";
      }
      if (values.campaign_end_date_continuous == 1) {
        values.campaign_end_date = "";
      }
      
      // console.log(values, "campaign Create")
    isEditMode ? dispatch(editCampaign(values)) : dispatch(createCampaign(values));
  };
  
    const saveAsTemplate = (values) => {
      if(!templateClientId){
        values.template_id = values.id;
        values.template_id = null;
        delete values.id;
      } else {
        values.template_id = templateClientId;
      }
      // console.log(values, 'template')
      dispatch(createCampaignTemplate(values))
    };

    const locationOptions = allClientLocation?.map((item) => ({
      value: item?.client_table_id,
      label: `${item?.location_name?.slice(0, 25)} - (${item?.client_table_id})`,
    }));

  return (
    <main>
      <div className="dashboard-wrap">
        <div className="back-and-heading-wrap">
          <div className="back-btn">
            <a href="/campaign-management">
              <img src="/images/menu-icons/left-arrow.png" alt="" />
            </a>
          </div>
          <h1>{isEditMode ? "Edit Campaign": "Create Campaign"}</h1>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize={true} >
            {({ setFieldValue, values, setValues }) => {
              useEffect(() => {
                if (uniqueCampaignId && !isEditMode) {
                  setFieldValue("campaign_id", uniqueCampaignId.toString());
                }
              }, [uniqueCampaignId, setFieldValue]);
          
              return (
                <Form >
                  {!data?.id && (
                  <div className="select-template-box" style={{ position: "absolute", right: "20px", top: '25px' }}>
                  <Field 
                    name="templateSelect" 
                    as="select" 
                    className="template-select" 
                    value={templateClientId}
                    onChange={(e) => {
                      const selectedClientId = e.target.value;
                      setTemplateClientId(selectedClientId);
                      const selectedTemplate = allCampaignTemplates?.find((template) => template.campaign_id == selectedClientId);

                      if (selectedTemplate) {
                        setClientId(selectedTemplate.client_id);
                        setClientTableId(selectedTemplate.location_id);            
                        setIsContinous(selectedTemplate.continuous == 1);
                        setCampaignPhoto(selectedTemplate.campaign_photo && backendUrl +"/"+ selectedTemplate.campaign_photo)
                        const isContinuous = selectedTemplate.continuous == 1;

                        // Set form values
                        setValues({
                          ...values, 
                          ...selectedTemplate, 
                          campaign_name: '',  // Clear the campaign name if needed
                          campaign_id: uniqueCampaignId.toString(),
                          location_id: selectedTemplate.location_id,
                          client_target_user_group_new_user : selectedTemplate.client_target_user_group_new_user == "1" ? 1 : 0,
                          client_target_user_group_current_user : selectedTemplate.client_target_user_group_current_user == "1" ? 1 : 0,
                          client_target_user_group_first_time_new_user : selectedTemplate.client_target_user_group_first_time_new_user == "1" ? 1 : 0,
                          age_restriction: selectedTemplate?.age_restriction ? (selectedTemplate?.age_restriction.includes("-500") ? selectedTemplate?.age_restriction.replace("-500", "") : "custom") : "",
                          customAgeFrom: selectedTemplate?.age_restriction && !selectedTemplate?.age_restriction.includes("-500")? selectedTemplate?.age_restriction.split("-")[0] : "",
                          customAgeTo: selectedTemplate?.age_restriction && !selectedTemplate?.age_restriction.includes("-500") ? selectedTemplate?.age_restriction.split("-")[1] : "",

                          campaign_photo: selectedTemplate?.campaign_photo,
                          amount_of_coupons_num_of_coupons: selectedTemplate.amount_of_coupon,
                          amount_of_coupons_amount_of_coupon_unlimented: selectedTemplate.amount_of_coupon_unlimented == "1" ? true : false,
                          campaign_start_date: selectedTemplate.campaign_start_date || "", 
                          campaign_end_date: isContinuous ? "" : selectedTemplate.campaign_end_date,
                          campaign_end_date_continuous: (isContinuous == 1 || isContinous == true) ? 1 : 0,
                        });
                      }
                    }} >
                  <option value="">Select an option</option>
                    {allCampaignTemplates?.map((value, index) => (
                      <option key={index} value={value.campaign_id}>
                        {value.campaign_name}-({value?.campaign_id})
                      </option>
                    ))}
                  </Field>
                </div>
                )}
                <div className="creat-new-user-wrap">
                  <div className="col-lg-12">
                    <div className="row">
                     
                      <div className="col-lg-3">
                        <label>
                          <h3>Client Name</h3>
                          <Field name="client_id">
                          {({ field, form }) => {
                            const selectedClient = allClients.find((item) => item.client_id === form.values.client_id);
                            return (
                              <Select
                                isLoading={client_loading}
                                isSearchable
                                placeholder={client_loading ? 'Loading...' : 'Select client'}
                                noOptionsMessage={() => (allClients.length === 0 ? 'No client Found' : 'No matches')}
                                options={allClients.map((item) => ({
                                  value: item?.client_id,
                                  label: `${item?.client_name} - (${item?.client_id})`,
                                }))}
                                value={selectedClient ? { value: selectedClient.client_id, label: `${selectedClient.client_name} - (${selectedClient.client_id})` } : null}
                                onChange={(option) => {
                                  const selectedClientId = option?.value;
                                  setClientId(selectedClientId);
                                  setClientTableId([])
                                  const selectedClient = allClients.find((item) => item.client_id == selectedClientId);
                                  setFieldValue("client_id", selectedClientId);
                                  setFieldValue("client_table_id", selectedClient?.id);
                                  setFieldValue("client_name", selectedClient?.client_name || "");
                                }}
                              />
                            );
                          }}
                          </Field>
                          <ErrorMessage
                            name="client_id"
                            component="div"
                            className="error-message d-flex"
                            style={{ color: 'red', fontSize: '12px', paddingLeft: '10px' }}
                          />
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3>Client Location</h3>
                          <Field name="location_id" as={Select} isMulti options={locationOptions} isLoading={location_loading} placeholder="Select client location" 
                          value={locationOptions?.filter(option => values.location_id?.includes(String(option.value)) || values.location_id?.includes(option.value))}
                          onChange={(selectedOptions) => {
                            const selectedIds = selectedOptions.map(option => option.value);
                            setFieldValue("location_id", selectedIds);
                            setClientTableId(prevState => {
                              const updatedClientTableId = selectedIds;
                              return updatedClientTableId;
                            });
                          }}/>
                          <ErrorMessage name="client_table_id" component="div" className="error-message d-flex" style={{ color: "red", fontSize: "12px", paddingLeft: "10px" }} />
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label>
                          <h3>Campaign Name:</h3>
                          <Field
                            type="text"
                            name="campaign_name"
                            placeholder="Enter campaign name"
                          />
                          <ErrorMessage name="campaign_name" component="div" className="error-message d-flex"
                            style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                          />
                        </label>
                      </div>
                      <div className="col-lg-3">
                        <label className="selected-id">
                          <h3>Campaign ID</h3>
                          <Field
                            type="text"
                            name="campaign_id"
                            readOnly
                          />
                        </label>
                      </div>

                      <h5>Target NFC Tags</h5>
                      <div className="target-NFC-box" style={{ maxHeight: '192px', overflowX: 'auto' }}>
                        {
                          nfcTags.length == 0 && nfcTags && <div style={{display:'flex', justifyContent:'center', alignItems:'center', paddingBottom:'10px', fontWeight:'bold'}}> No NFC Tag Found </div>
                        }

                        {nfcTags.length > 0 && nfcTags && (
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' , gap: '35px' }}>
                              <h3 style={{width: '15px'}}>&nbsp;</h3>
                              <h3 style={{width: '100%', textAlign: 'center'}}> NFC Tags </h3>
                              <h3 style={{width: '100%', textAlign: 'center'}}> Tag Name </h3>
                              <h3 style={{width: '100%', textAlign: 'center'}}> Client Location </h3>
                              <h3 style={{width: '100%', textAlign: 'center'}}> Location Tag Placement </h3>
                          </div>
                        )}
                          
                        {nfcTags?.map((tag, index) => (
                          <div className="target-headingNFC-wrap" style={{ maxHeight: '36px', paddingTop: '25px', paddingBottom: '25px', overflow: 'hidden' }} key={index}>
                            <input type="checkbox" checked={values.target_nfc_tags_ids?.includes(String(tag?.id))}
                            onChange={() => {
                              const updatedNfcTags = [...values.target_nfc_tags_ids];
                              if (updatedNfcTags.includes(String(tag.id))) {
                                setFieldValue('target_nfc_tags_ids', updatedNfcTags.filter((id) => id !== String(tag.id)));
                              } else {
                                setFieldValue('target_nfc_tags_ids', [...updatedNfcTags, String(tag.id)]);
                            }}}/>
                            <input type="text" placeholder={tag?.tag_id} disabled />
                            <input type="text" placeholder={tag?.tag_name} disabled />
                            <input type="text" placeholder={tag?.location_name} disabled />
                            <input type="text" placeholder={tag?.location_tag_placement} disabled />
                          </div>
                        ))}
                      </div>
  
                      <h5 className="pb-3">Client Target User Groups</h5>
  
                      <div className="col-lg-3">
                        <label className="client-target-check">
                          <Field
                            type="checkbox"
                            name="client_target_user_group_new_user"
                            onChange={(e) => {
                              setFieldValue("client_target_user_group_new_user", e.target.checked ? 1 : 0);
                            }}
                          />
                          <h3>New Users</h3>
                        </label>
                        
                      </div>
  
                      <div className="col-lg-3">
                        <label className="client-target-check">
                          <Field
                            type="checkbox"
                            name="client_target_user_group_current_user"
                            onChange={(e) => {
                              setFieldValue("client_target_user_group_current_user", e.target.checked ? 1 : 0);
                            }}
                          />
                          <h3>Current Users</h3>
                        </label>
                      </div>
  
                      <div className="col-lg-3">
                        <label className="client-target-check">
                          <Field
                            type="checkbox"
                            name="client_target_user_group_first_time_new_user"
                            onChange={(e) => {
                              setFieldValue("client_target_user_group_first_time_new_user", e.target.checked? 1 : 0);
                            }}
                          />
                          <h3>First-Time User Coupons</h3>
                        </label>
                      </div>
  
                      <h5 className="pb-3">Amount of Coupons</h5>
  
                      <div className="col-lg-3">
                        <label>
                          <h3>No. of Coupons</h3>
                          <Field
                            type="text"
                            name="amount_of_coupons_num_of_coupons"
                            placeholder="Enter the no. of coupons"
                            value={values?.amount_of_coupons_num_of_coupons ||coupons}
                            onChange={(e) => {
                              setCoupons(e.target.value);
                              setFieldValue("amount_of_coupons_num_of_coupons", e.target.value)
                            }}
                            disabled={isUnlimited}
                          />
                        <ErrorMessage name="amount_of_coupons_num_of_coupons" component="div" className="error-message d-flex"
                        style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }} />
                        </label>
                      </div>
  
                      <div className="col-lg-3">
                        <label className="no-expariton-check">
                          <Field type="checkbox" name="amount_of_coupons_amount_of_coupon_unlimented" checked={isUnlimited} onChange={(e) => {
                            setFieldValue("amount_of_coupons_amount_of_coupon_unlimented", e.target.checked ? 1 : 0)
                            handleCheckboxChange(e);
                            if (e.target.checked) {
                              setFieldValue("amount_of_coupons_num_of_coupons", "")
                            }
                          }} />
                          <h3>Unlimited</h3>
                        </label>
                      </div>
  
                      <h5 className="pb-3">Age Restrictions</h5>
                      
                      <div className="col-lg-2">
                        <label className="client-target-check">
                          <Field type="radio" name="age_restriction" value="13" 
                            onChange={(e) => {
                              setFieldValue("age_restriction", e.target.value);
                              setFieldValue("customAgeFrom", "");
                              setFieldValue("customAgeTo", "");
                            }} />
                          <h3>Over 13</h3>
                        </label>
                      </div>

                      <div className="col-lg-2">
                        <label className="client-target-check">
                          <Field type="radio" name="age_restriction" value="16" 
                            onChange={(e) => {
                              setFieldValue("age_restriction", e.target.value);
                              setFieldValue("customAgeFrom", "");
                              setFieldValue("customAgeTo", "");
                            }} />
                          <h3>Over 16</h3>
                        </label>
                      </div>

                      <div className="col-lg-2">
                        <label className="client-target-check">
                          <Field type="radio" name="age_restriction" value="18" 
                            onChange={(e) => {
                              setFieldValue("age_restriction", e.target.value);
                              setFieldValue("customAgeFrom", "");
                              setFieldValue("customAgeTo", "");
                            }} />
                          <h3>Over 18</h3>
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <div className="custom-age-in">
                          <label className="client-target-check">
                            <Field type="radio" name="age_restriction" value="custom"
                              onChange={(e) => setFieldValue("age_restriction", e.target.value)} />
                            <h3>Custom Age:</h3>
                          </label>
                          <Field
                            type="number"
                            name="customAgeFrom"
                            style={{ width: "50px" }}
                            placeholder="From"
                            disabled={values.age_restriction !== "custom"}
                          />
                          -
                          <Field
                            type="number"
                            name="customAgeTo"
                            style={{ width: "50px" }}
                            placeholder="To"
                            disabled={values.age_restriction !== "custom"}
                          />
                        </div>
                      </div>

                      <div className="col-lg-3">
                        <div className="custom-file-upload3">
                          <label htmlFor="master_file"> Campaign Photo</label>
                          <input
                            type="file"
                            name="campaign_photo"
                            id="master_file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setFieldValue("campaign_photo",file)
                              setCampaignPhoto(URL.createObjectURL(file));
                            }
                            }
                            style={{ display: "none" }}
                          />
                          <img src={campaignPhoto || "/images/menu-icons/company-uploadlogo.png"} className="upl_img"  style={{ width:'32px', height:"32px"}}/>
                        </div>
                        <ErrorMessage name="campaign_photo" component="div" className="error-message d-flex"
                        style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }}
                      />
                      </div>
  
                      <div className="col-lg-3">
                      <ErrorMessage name="age_restriction" component="div" className="error-message d-flex"
                        style={{ color: "red", fontSize: "12px", paddingLeft: "10px",paddingBottom:"20px" }} /> 
                        <label htmlFor="" className="start-end-date">
                          <h3>Start Date</h3>
                          <Field name="campaign_start_date">
                            {({ field, form }) => (
                              <DatePicker
                                {...field}
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => {
                                  form.setFieldValue('campaign_start_date', convertToYYYYMMDD(date));
                                  form.setFieldValue('campaign_end_date', null);
                                }}
                                shouldDisableDate={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0); // Set to start of the day to avoid time comparisons
                                  return date < today; // Disable dates before today
                                }}
                                format="dd/MM/yyyy" 
                                oneTap
                                placeholder="Select start date"
                              />
                            )}
                          </Field>
                          <img src="/images/menu-icons/calender-icon.png" alt="" />
                        <ErrorMessage name="campaign_start_date" component="div" className="error-message d-flex"
                        style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }} />
                        </label>
                      </div>

                      <div className="col-lg-3">
                        <label htmlFor="" className="start-end-date">
                          <h3>End Date</h3>
                          <Field name="campaign_end_date">
                            {({ field, form }) => (
                              <DatePicker
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => form.setFieldValue('campaign_end_date', convertToYYYYMMDD(date))}
                                // format="yyyy-MM-dd" 
                                format="dd/MM/yyyy" 
                                oneTap
                                placeholder="Select end date" 
                                disabled={isContinous}
                                shouldDisableDate={date => {
                                  const startDate = form.values.campaign_start_date;
                                  if (!startDate) return false;
                                  // Disable dates before the start date
                                  // return date < new Date(startDate);
                                  const selectedDate = new Date(date.setHours(0, 0, 0, 0));
                                  const campaignStartDate = new Date(new Date(startDate).setHours(0, 0, 0, 0));
                                  return selectedDate < campaignStartDate; // allows same day
                                }}
                              />
                            )}
                          </Field>
                          <img src="/images/menu-icons/calender-icon.png" alt="" />

                        <ErrorMessage name="campaign_end_date" component="div" className="error-message d-flex"
                          style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }} />
                        </label>
                      </div>
  
                      <div className="col-lg-3">
                        <label className="no-expariton-check">
                          <Field type="checkbox" name="campaign_end_date_continuous" checked={isContinous} onChange={
                            (e) => {
                              handlecontinuousCheckboxChange(e);
                              setFieldValue("campaign_end_date_continuous", e.target.checked ? 1 : 0);
                              if (e.target.checked) {
                                setFieldValue("campaign_end_date", "");
                              }
                            }
                          } />
                          <h3>continuous</h3>
                        </label>
                      </div>
  
                      <div className="col-lg-12">
                        <label>
                          <h3>Campaign Terms and Conditions</h3>
                          <Field
                            as="textarea"
                            name="campaign_term_and_condition"
                            placeholder="Enter your Campaign Terms and Conditions"
                            className="company-slogan"
                          />
                          <ErrorMessage name="campaign_term_and_condition" component="div" className="error-message d-flex" style={{ color: "red", fontSize: "12px", paddingLeft: "10px", }} /> 
                        </label>
                      </div>
                    </div>
                  </div>
  
                  <div className="big-modal-common-btns">
                    <button type="submit" style={{ 
                        borderRadius: "30px", color: "#fff", textAlign: "center", padding: "10px 43px",
                        backgroundColor: "#2a0181", fontSize: "15px", width: "auto", fontWeight: "400",
                        boxShadow: "0px 4px 4px 0px #00000040",
                      }}>
                      {isEditMode ? "Update" : "Save"}
                    </button>
                    {!isEditMode && <button type="button" 
                      style={{ borderRadius: "30px", color: "#fff", textAlign: "center", padding: "10px 43px",
                        backgroundColor: "#a69020", fontSize: "15px", width: "auto", fontWeight: "400",
                        boxShadow: "0px 4px 4px 0px #00000040", }} onClick={() => saveAsTemplate(values)} >
                       {templateClientId ? "Update Template" : "Save as template"}
                    </button>}
                  </div>
                </div>
                </Form>
              )
            }}
          </Formik>
        </div>
      </div>
    </main>
  );
};

export default CreateEditCampaign;
