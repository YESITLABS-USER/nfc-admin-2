import React, { useCallback, useEffect, useState } from "react";
import Pagination from "../components/Pagination";
// import SearchDropdown from "../components/SearchDropdown";
import HideShow from "../components/HideShow";
import DeletePopup from "../components/DeletePopup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteCoupan, getAllCoupans, UpdateCoupanStatus } from "../redux/slices/coupanSlice";
import { formatDate } from "../assets/common";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CustomDateRangePicker from "../components/DateRangePicker";
import { format } from "date-fns";


const CoupansManagement = () => {
  const dispatch = useDispatch();
  const { allCoupans, loading } = useSelector((state) => state.coupans)

  const [filteredData, setFilteredData] = useState([]);
  const [currentData, setCurrentData] = useState([]); // For the current user data displayed
  // const [showLocationInput, setShowLocationInput] = useState(false);
  // const [showCampaignInput, setShowCampaignInput] = useState(false);

  const [currentDeleteData, setCurrentDeleteData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [currentModalData, setCurrentModalData] = useState({});
    const [showCustomModal, setCustomModal] = useState(false)
  const navigate = useNavigate();
  
  useEffect(() => {
    dispatch(getAllCoupans());
  }, [dispatch]);
  
  useEffect(() => {
    if(allCoupans){
      setFilteredData(allCoupans);
    }
  },[allCoupans])

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
        dispatch(deleteCoupan({id: currentDeleteData}))
        // setFilteredData((prevData) =>
        //   prevData.filter((item) => item?.id !== currentDeleteData)
        // );
      }
      handleClose(); 
    };

    const handleCustomShow = (modalData) => {
      setCurrentModalData(modalData);
      setCustomModal(true);
    };
    
    const handleCustomClose = () => {
      setCustomModal(false)
      setCurrentModalData(null);
    };

  // const handleLocationSearchValue = (data) => {
  //   const searchData = data.trim();
  //   if (searchData) {
  //     setFilteredData(
  //       currentData.filter((item) => item?.location_name?.toLowerCase().includes(searchData.toLowerCase())) );
  //    } else { setFilteredData(allCoupans); 
  //   }};

  //   const handleCampaignSearchValue = (data) => {
  //     const searchData = data.trim();
  //     if (searchData) {
  //       setFilteredData(
  //         allCoupans.filter((item) => item?.campaign_name?.toLowerCase().includes(searchData.toLowerCase())) );
  //      } else { 
  //       setFilteredData(allCoupans); 
  //     }
  //   };

  const updateHideShowStatus = (updatedStatus) => {
     if(updatedStatus.campaignStatus){
          dispatch(UpdateCoupanStatus({id: updatedStatus?.id}));
        } else{
          toast.error("Campaign status is deactive")
        }
    // dispatch(UpdateCoupanStatus({id: updatedStatus?.id}));
    // setCurrentData((prevCampaigns) =>
    //   prevCampaigns.map((data) =>
    //     data.id === updatedStatus.id ? { ...data, status: updatedStatus.status } : data )
    // );
  };

  const handleGlobalSearch = (value) => {
    const lowerCaseSearchText = value?.toLowerCase()?.trim();
    const filtered = allCoupans.filter((item) => {
      return Object.values(item)
        .filter((value) => typeof value === "string" || typeof value === "number") // Filter out non-searchable types
        .join(" ")
        .toLowerCase()
        .includes(lowerCaseSearchText);
    });
    setFilteredData(filtered);
  };

  const handleCancelGlobalSearch = () => {
    setFilteredData(allCoupans); // Reset to original data
  };
// For Date Search Functionality
  const handleDateSearch = (dateRange) => {
      const [startDate, endDate] = dateRange.map((date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        return normalizedDate;
      });
        
      const filteredData = allCoupans.filter((item) => {
        const itemDate = new Date(item?.created_at);
        itemDate.setHours(0, 0, 0, 0); 
        return itemDate >= startDate && itemDate <= endDate;
      });
    
      setFilteredData(filteredData); 
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
      setFilteredData(allCoupans); 
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

              {/* <SearchDropdown 
                label="Client Location"
                isOpen={showLocationInput}
                setIsOpen={setShowLocationInput}
                onSearchChange={handleLocationSearchValue}
              />
              <SearchDropdown 
                label="Campaign filter"
                isOpen={showCampaignInput}
                setIsOpen={setShowCampaignInput}
                onSearchChange={handleCampaignSearchValue}
              /> */}
              <button type="button" className="influ-btn" id="create-coupon" onClick={() => navigate("/coupons-management/create-coupon")}>
                Create New Coupons
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
                  <th>Coupon Name</th>
                  <th>Coupon ID</th>
                  <th>Client name</th>
                  {/* <th>Client location</th> */}
                  <th>Campaign name</th>
                  <th>Campaign ID</th>
                  <th>Campaign Status</th>
                  <th>Valid scan frequency</th>
                  <th>Select time unit</th>
                  <th>Valid scan qty</th>
                  <th>Coupon Type:</th>
                  <th>Enter value (€)</th>
                  <th>Product restrictions</th>
                  <th>Usage limit</th>
                  <th>Select time unit</th>
                  <th> Birthday Coupan</th>
                  <th>Expiration Date</th>
                  <th>Other customization</th>
                  <th>Coupons status</th>
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
                        <td>{item?.serial_number}.</td>
                        <td>{item?.coupon_name}</td>
                        <td>{item?.coupon_id}</td>
                        <td>{item?.client_name}</td>
                        {/* <td>{item?.location_name}</td> */}
                        <td>{item?.campaign_name}</td>
                        <td>{item?.campaign_id}</td>
                        <td>{item?.show_campaign_status ? "Active" : "Deactive"}</td>
                        <td>{item?.valid_scan_freq}</td>
                        <td>{item?.select_time_unit}</td>
                        <td>{item?.valid_scan_qty}</td>
                        <td>{item?.coupon_type}</td>
                        <td>{item?.coupon_type_content?.[0]?.spending_value}</td>
                        <td>
                          <a href="" className="modal-trigger"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCustomShow({
                                id: "business-aboutus",
                                title: "Product Restrictions",
                                contentType: "text",
                                textContent: item?.coupon_type_content?.[0]?.product_restrictions,
                                contentClassName: "business-about-us",
                              });
                            }} >
                            View
                          </a>
                        </td>
                        <td>{item?.usages_limit_no_limit ? "No Limit" : item?.usages_limit_select_number}</td>
                        <td>{item?.usages_limit_select_time_unit}</td>
                        <td> {item?.start_date_from_dob == 1 &&
                          <a href="" className="modal-trigger"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCustomShow({
                                id: "business-aboutus",
                                title: "Birthday Coupon",
                                contentType: "text",
                                textContent: `${item.days_before_dob}-${item?.days_after_dob}`,
                                contentClassName: "business-about-us",
                              });
                            }} >
                            View
                          </a>}
                        </td>
                        <td>{item?.validity_expiration_date ?  formatDate(item?.validity_expiration_date) : "No-Expiration"}</td>
                        <td>
                          <a href="" className="modal-trigger"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCustomShow({
                                id: "business-aboutus",
                                title: "Other Customizations",
                                contentType: "text",
                                textContent: (
                                  <span
                                    className="business-about-us"
                                    dangerouslySetInnerHTML={{ __html: item?.other_customization }}
                                  />
                                ),
                                contentClassName: "business-about-us",
                              });
                            }} >
                            View
                          </a>
                        </td>

                        <HideShow 
                          item={{ id: item?.id, campaignStatus:item?.show_campaign_status, status: item?.show_campaign_status ? item?.status : 0, name:"coupons status" }}
                          updateHideShowStatus={updateHideShowStatus}
                        />
                        <td>
                          <div className="social-action-wrap">
                            <a style={{cursor:'pointer'}} onClick={() => navigate("/coupons-management/edit-coupon", { state: { data: item } })}>
                              <img src="/images/menu-icons/edit-icon.svg" alt="edit" />
                            </a> 
                            <a style={{cursor:'pointer'}} onClick={()=> handleDeleteShow(item?.id)} >
                              <img src="/images/menu-icons/delete-icon.svg" alt="delete"/>
                            </a>
                          </div>
                        </td>
                    </tr>
                ))}
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

export default CoupansManagement;


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
            {modalData?.contentType === "image" && (
              <div className="business-logo-img">
                <img src={modalData.imageSrc ? `${import.meta.env.VITE_BACKEND_URL}/${modalData.imageSrc}` : noImage}
                  alt={modalData?.title || "no image availabel"} style={{maxWidth:'200px'}}
                />
              </div>
            )}
            {modalData?.contentType === "text" && (
              <div className={modalData?.contentClassName}>
                {
                  modalData?.title == "Birthday Coupon" ? 
                  <div className="container text-3xl">
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <h5 className="text-decoration-underline text-center flex-grow-1">Before</h5>
                      <h5 className="text-decoration-underline text-center flex-grow-1">After</h5>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                      <h2 className="text-center flex-grow-1">{modalData?.textContent.split("-")?.[0] || "5"} Days</h2>
                      <h2 className="text-center flex-grow-1">{modalData?.textContent.split("-")?.[1] || "5"} Days</h2>
                    </div>
                  </div>
                    :
                <p>{modalData?.textContent ? modalData?.textContent : "No Data"}</p>
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
