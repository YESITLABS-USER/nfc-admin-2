import React, { useCallback, useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import ViewModal from "../components/ViewModal";
import HideShow from "../components/HideShow";
import DeletePopup from "../components/DeletePopup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteCampaign, getAllCampaign, getAllLocationCampaignId, getSelectedNfc, UpdateCampaignStatus } from "../redux/slices/campaignSlice";
import { formatDate } from "../assets/common";
import CustomDateRangePicker from "../components/DateRangePicker";
import { format } from "date-fns";
import { Modal } from "react-bootstrap";

const CampaignManagement = () => {
  const dispatch = useDispatch();
  const { allCampaigns, tableNfcTags, loading } = useSelector((state) => state.campaign)

  const [filteredData, setFilteredData] = useState([]);
  const [currentData, setCurrentData] = useState([])
  const [showViewModal, setShowViewModal] = useState();
  const [showViewNfc, setShowViewNfc] = useState();
  const [currentModalData, setCurrentModalData] = useState(null);

  // Delete Popup
  const [currentDeleteData, setCurrentDeleteData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentNfcDetails, setCurrentNfcDetails] = useState(null);
  const [showCustomModal, setCustomModal] = useState(false)
  
  const navigate = useNavigate();
  
  useEffect(() => {
    dispatch(getAllCampaign());
  }, [dispatch]);

  
  useEffect(() => {
    if(currentNfcDetails) {
      dispatch(getSelectedNfc(currentNfcDetails));
    }
  }, [currentNfcDetails]);

  useEffect(() => {
    if(allCampaigns){
      setFilteredData(allCampaigns);
    }
  },[allCampaigns])

  const handleDeleteShow = (modalData) => {
    setCurrentDeleteData(modalData);
    setShowDeleteModal(true);
  };
  
  const handleClose = () => {
    setShowDeleteModal(false);
    setCurrentDeleteData(null);
  };
  
  const handleDelete = () => {
    if (currentDeleteData) {
      dispatch(deleteCampaign({id : currentDeleteData}));
    }
    handleClose(); 
  };

  const handleViewModal = (campaignData) => {
    setShowViewNfc(true);
    setCurrentNfcDetails({client_table_id : campaignData?.client_table_id, client_id : campaignData?.client_id})
    setCurrentModalData({contentType : "text" , title: "NFC Tags", textContent: campaignData?.target_nfc_tags});
  }

  const handleViewModalTerms = (campaignData) => {    
    setShowViewModal(true);
    setCurrentModalData({contentType : "text" , title: "Campaign Terms and Conditions", textContent: campaignData?.campaign_term_and_condition});
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setShowViewNfc(false)
    setCurrentModalData(null);
  }

  const updateHideShowStatus = (updatedStatus) => {
    dispatch(UpdateCampaignStatus({id: updatedStatus?.id}));
  };

  const handleGlobalSearch = (value) => {
    const lowerCaseSearchText = value?.toLowerCase()?.trim();
    const filtered = allCampaigns.filter((item) => {
      return Object.values(item)
        .filter((value) => typeof value === "string" || typeof value === "number") 
        .join(" ")
        .toLowerCase()
        .includes(lowerCaseSearchText);
    });
    setFilteredData(filtered);
  };

  const handleCancelGlobalSearch = () => {
    setFilteredData(allCampaigns);
  };

  const handleDateSearch = (dateRange) => {
    const [startDate, endDate] = dateRange.map((date) => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      return normalizedDate;
    });
      
    const filteredData = allCampaigns.filter((item) => {
      const itemDate = new Date(item?.created_at);
      itemDate.setHours(0, 0, 0, 0); 
      return itemDate >= startDate && itemDate <= endDate;
    });
  
    setFilteredData(filteredData); 
  };

  const handleCustomShow = async (modalData) => {
    const locationData =  await dispatch(getAllLocationCampaignId({campaign_table_id: modalData?.campaign_id}));

    const updatedModalData = {
      ...modalData,
      textContent: locationData?.payload.data || [], 
    };
    
    setCurrentModalData(updatedModalData);
    setCustomModal(true);
  };
  
  const handleCustomClose = () => {
    setCustomModal(false)
    setCurrentModalData(null);
  };
  
  const handleApply = useCallback(
    (range) => {
      if (range?.length === 2) {
        const formattedDates = range.map((date) => format(date, "yyyy-MM-dd")); // Format as yyyy-MM-dd
        handleDateSearch(formattedDates);
      }
    },
    [handleDateSearch]
  );
    
  const handleDateCancel = () => {
    setFilteredData(allCampaigns); 
  };

  return (
    <main>
      <div className="dashboard-wrap">
        <div className="influ-strip-2">
          <form>
            <div className="influ-search">
              <label>
                <input type="text" placeholder="Search"
                  onKeyDown={(e) => { if (e.key === "Enter") { handleGlobalSearch(e.target.value); } }}
                  onChange={(e) => {
                  const value = e.target.value;
                    if (value.trim()) { handleGlobalSearch(value); }
                    else { handleCancelGlobalSearch(e.target.value); }
                }} />
                <button> <img src="/images/menu-icons/search-icon.png" alt="" /> </button>
              </label>
            </div>
            <div className="influ-btns">
              <CustomDateRangePicker onApply={handleApply} onCancel={handleDateCancel}/>

              <button type="button" className="influ-btn" id="create-campaign" onClick={() => navigate("/campaign-management/create-campaign")}>
                Create New Campaign
              </button>

            </div>
          </form>
        </div>
        <div className="influ-table">
          <div id="table-responsive-1" className="table-responsive">
            <table>
              <tbody>
                <tr>
                  <th>Sr no</th>
                  <th>Client name</th>
                  <th>Client location</th>
                  <th>Campaign name</th>
                  <th>Campaign ID</th>
                  <th>Date of Creation</th>
                  <th>Total coupons</th>
                  <th>Total Loyalty cards</th>
                  <th>Target NFC Tags</th>
                  <th>Target User Groups</th>
                  <th>First-Time User Coupon</th>
                  <th>Amount of coupons</th>
                  <th>Durations</th>
                  <th>Terms & Conditions</th>
                  <th>Campaign status</th>
                  <th>Action</th>
                </tr>

                {currentData.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: "40px 0", fontWeight: "bold", fontSize: "30px",}}>
                        {loading ? "Loading..." : "No data found"}
                      </td>
                    </tr>
                  )}
                {currentData.map((item, index) => (
                    <tr key={index}>
                      <td>{item?.serial_number}</td>
                      <td>{item?.client_name}</td>
                      {/* <td>{item?.client_location}</td> */}
                      <td>
                        <a href="" className="modal-trigger"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCustomShow({
                              campaign_id: item?.id,
                              id: "business-slogan",
                              title: "Client Location's",
                              textContent: "hiii I am ",
                              contentClassName: "business-slogan",
                            });
                          }} >
                          View
                        </a>
                      </td>
                      <td>{item?.campaign_name}</td>
                      <td>{item?.campaign_id}</td>
                      <td>{formatDate(item?.created_at)}</td>
                      <td>{item?.total_coupon_count}</td>
                      <td>{item?.total_loyalty_cards}</td>
                      <td>
                        <a href="#" style={{color: "#2C0186"}} onClick={() => handleViewModal(item)} >
                          View
                        </a>
                      </td>
                      <td> {item?.client_target_user_group_new_user && "New User" || item?.client_target_user_group_current_user && "Current User" || (item?.client_target_user_group_new_user && item?.client_target_user_group_current_user) && "New and Current " || ""}</td>

                      <td>{item?.client_target_user_group_first_time_new_user ? "Yes" : "No"}</td>

                      <td>{item?.amount_of_coupon_unlimented == 1 ? "Unlimited" : item?.amount_of_coupon}</td>

                      <td>
                        {item?.continuous ? `${formatDate(item?.campaign_start_date)} - No Expiration` 
                          : `${formatDate(item?.campaign_start_date)} - ${formatDate(item?.campaign_end_date)}`} 
                      </td>

                      <td>
                        <a style={{color: "#2C0186"}} onClick={() =>handleViewModalTerms(item)}> View </a>
                      </td>
                      <HideShow item={{ id: item?.id, status: item?.show_campaign_status, name: "campaign", title1:"inactive", title2: "Active" }} updateHideShowStatus={updateHideShowStatus} />

                      <td>
                        <div className="social-action-wrap">
                          <a onClick={() => navigate("/campaign-management/edit-campaign", { state: { data: item } })}> <img src="/images/menu-icons/edit-icon.svg" alt="edit" /> </a>
                          <a> <img src="/images/menu-icons/delete-icon.svg" alt="delete" onClick={()=> handleDeleteShow(item?.id)}/> </a>
                        </div>
                      </td>

                    </tr>
                  ))
                }                
              </tbody>
            </table>
          </div>
          <Pagination
              data={filteredData}
              itemsPerPageOptions={[10, 50, 100, 150, 250, "all"]}
              onPageDataChange={setCurrentData}
          />
        </div>
      </div>

      {/* For View Nfc Tags */}
      <ViewModal
        show={showViewModal}
        handleClose={handleCloseViewModal}
        modalData={currentModalData}
      />

      <ModalComponent
        show={showViewNfc}
        handleClose={handleCloseViewModal}
        modalData={currentModalData}
        allTags={tableNfcTags}
      />

      <DeletePopup
        show={showDeleteModal}
        handleClose={handleClose}
        handleDelete={handleDelete}
        modalData={currentDeleteData}
      />
      <CustomModal
        show={showCustomModal}
        handleClose={handleCustomClose}
        modalData={currentModalData}
      />
    </main>
  );
};

export default CampaignManagement;

const ModalComponent = ({ show, handleClose, modalData, allTags }) => {
  return (
    <Modal show={show} onHide={handleClose} aria-labelledby="terms-conditions-popup" size="lg"
      dialogClassName="medium-modal-common" >
      <Modal.Body style={{position:'relative'}}>
        <img src="/images/menu-icons/close-popup-icon.svg" alt="Close" style={{position:'absolute', right:'10px', cursor:'pointer'}} onClick={handleClose}/>
        <div className="common-form-wrap">
          <form>
            <div className="common-pop-warp">
              <h3>{modalData?.title}</h3>
              <div className="campaign-termsbox-wrap">
                <div className="target-NFC-box" style={{ maxHeight: '192px', overflowX: 'auto' }}>
                  { allTags.length == 0 && allTags && <div style={{display:'flex', justifyContent:'center',   alignItems:'center', paddingBottom:'10px', fontWeight:'bold'}}> No NFC Tag Found </div>
                  }

                {allTags.length > 0 && allTags && (
                  <div className="target-headingNFC-wrap" style={{ maxHeight: '36px', paddingTop: '25px', paddingBottom: '25px', overflow: 'hidden' }}>
                      <input type="text" placeholder={"NFC Tags"} disabled style={{backgroundColor:'transparent', border:"none", outline:"none"}} />
                      <input type="text" placeholder={"Tag Type"} disabled style={{backgroundColor:'transparent', border:"none", outline:"none"}} />
                      <input type="text" placeholder={"Client Location"} disabled style={{backgroundColor:'transparent', border:"none", outline:"none"}} />
                      <input type="text" placeholder={"Location Tag Placement"} disabled style={{backgroundColor:'transparent', border:"none", outline:"none"}} />
                    </div>
                )}
                          
                  {allTags?.map((tag, index) => (
                    <div className="target-headingNFC-wrap" style={{ maxHeight: '36px', paddingTop: '25px', paddingBottom: '25px', overflow: 'hidden' }} key={index}>
                      <input type="text" placeholder={tag?.tag_id} disabled />
                      <input type="text" placeholder={tag?.tag_type} disabled />
                      <input type="text" placeholder={tag?.location_name} disabled />
                      <input type="text" placeholder={tag?.location_tag_placement} disabled />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const CustomModal = ({ show, handleClose, modalData }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal fade"
      id={modalData?.id}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="myModalLabel"
    >
      <div className="modal-dialog-edit" role="document">
        <div className="modal-content clearfix">
          <div className="modal-heading">
            <button
              type="button"
              className="close close-btn-front"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={handleClose}
            >
              <img src="/images/menu-icons/close-popup-icon.svg" alt="Close" />
            </button>
          </div>
          <div className="modal-body">
            <div className="logout-pop-wrap">
              <h2>{modalData?.title}</h2>
            </div>

            <div className={modalData?.contentClassName}>
              {
                modalData?.title =="Client Location's" ? <div>
                {/* Render location items safely */}
                {modalData?.textContent?.length ? (
                  modalData?.textContent?.map((item, index) => (
                    <div key={index}>
                      <span>{item?.serial_number} . </span>
                      <span>{item?.location_name}</span>
                    </div>
                  ))
                ) : (
                  <p>No locations found.</p>
                )}
              </div> : <p>{modalData?.textContent}</p>
              }
              
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};