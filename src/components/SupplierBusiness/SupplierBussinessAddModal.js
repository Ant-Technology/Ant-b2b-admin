import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
  Tabs,
  SimpleGrid,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { CREATE_SUPPLIER, CREATE_SUPPLIER_Business } from "apollo/mutuations";
import {
  GET_MY_SUPPLIERS_Business,
  GET_REGIONS,
  GET_SUPPLIERS,
} from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { useMemo } from "react";
import { useRef } from "react";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";
const Loader = () => (
  <ContentLoader
    width="100%"
    height={400}
    backgroundColor="#f0f0f0"
    foregroundColor="#dedede"
  >
    <rect width="100%" height="400px" />
  </ContentLoader>
);

const containerStyle = {
  width: "100%",
  height: "400px",
};
const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";
const libraries = ["places"];
const SupplierBusinessAddModal = ({ setOpened, size, activePage }) => {
  const [location, setLocation] = useState({});
  const [center, setCenter] = useState({ lat: 8.9999645, lng: 38.7700539 });
  const [autocomplete, setAutocomplete] = useState();
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);

  const [mapRef, setMapRef] = useState(null);
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];
      regions.data.forEach((region, index) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });
      setRegionsDropDownData([...regionsArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  useEffect(() => {
    if (
      location &&
      Object.keys(location) &&
      Object.keys(location)?.length > 0
    ) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const mapLoadHandler = (map) => {
    setMapRef(map);
  };

  const onPlaceChangedHandler = () => {
    if (autocomplete !== null) {
      setCenter({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
      setLocation({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  const autocompleteLoadHandler = (autocomplete) => {
    setAutocomplete(autocomplete);
  };
  const form = useForm({
    initialValues: {
      business_name: "",
      business_email: "",
      business_phone_number: "",
      business_website: "",
      business_type: "",
      business_region_id: "2",
      business_zone: "",
      business_woreda: "",
      business_kebele: "",
      business_geo_location: {
        lat: null,
        lng: null,
      },
      owner_firstname: "",
      owner_middlename: "",
      owner_lastname: "",
      owner_phone_number: "09988888889",
      owner_id_type: "",
      tin: "",
      number_of_warehouses: 3,
      business_registration_number: "",
      validate: {
        business_name: (value) => (!value.trim() ? "Required" : null),
        business_type: (value) => (!value ? "Required" : null),
        business_phone_number: (value) => (!value.trim() ? "Required" : null),
        number_of_warehouses: (value) => (!value ? "Required" : null),
        tin: (value) => (!value.trim() ? "Required" : null),
        business_registration_number: (value) =>
          !value.trim() ? "Required" : null,
        business_zone: (value) => (!value.trim() ? "Required" : null),
        business_woreda: (value) => (!value.trim() ? "Required" : null),
        business_kebele: (value) => (!value.trim() ? "Required" : null),
        business_geo_location: (value) =>
          !value.lat || !value.lng ? "Location is required" : null,
        owner_firstname: (value) => (!value.trim() ? "Required" : null),
        owner_lastname: (value) => (!value.trim() ? "Required" : null),
        owner_id_type: (value) => (!value ? "Required" : null),
      },
    },
  });
  const [fileErrors, setFileErrors] = useState({
    owner_id: "",
    tin_certification_document: "",
    trade_license_document: "",
  });

  const validateCurrentTab = () => {
    let valid = true;
    let errors = {};

    switch (activeTab) {
      case "business-info":
        errors = form.validate({
          fieldNames: [
            "business_name",
            "business_type",
            "business_phone_number",
            "number_of_warehouses",
            "tin",
            "business_registration_number",
          ],
        }).errors;

        // Check if any errors exist in form
        if (Object.keys(errors).length > 0) {
          valid = false;
        }
        break;

      case "business-address":
        errors = form.validate({
          fieldNames: [
            "business_zone",
            "business_woreda",
            "business_kebele",
            "business_geo_location",
          ],
        }).errors;

        // Check if any errors exist in form
        if (Object.keys(errors).length > 0) {
          valid = false;
        }
        break;

      case "business-owner":
        errors = form.validate({
          fieldNames: ["owner_firstname", "owner_lastname", "owner_id_type"],
        }).errors;

        // Check if any errors exist in form
        if (Object.keys(errors).length > 0) {
          valid = false;
        }

        // File validation for owner ID
        if (files.owner_id.length === 0) {
          setFileErrors((prev) => ({ ...prev, owner_id: "Required" }));
          valid = false;
        } else {
          setFileErrors((prev) => ({ ...prev, owner_id: null }));
        }
        break;

      case "business-documents":
        // File validation for documents
        if (files.tin_certification_document.length === 0) {
          setFileErrors((prev) => ({
            ...prev,
            tin_certification_document: "Required",
          }));
          valid = false;
        } else {
          setFileErrors((prev) => ({
            ...prev,
            tin_certification_document: null,
          }));
        }

        if (files.trade_license_document.length === 0) {
          setFileErrors((prev) => ({
            ...prev,
            trade_license_document: "Required",
          }));
          valid = false;
        } else {
          setFileErrors((prev) => ({
            ...prev,
            trade_license_document: null,
          }));
        }
        break;
    }

    return valid;
  };

  const [createSupplierBusiness, { loading: supplierLoading }] = useMutation(
    CREATE_SUPPLIER_Business,
    {
      update(cache, { data: { createSupplierBusiness } }) {
        cache.updateQuery(
          {
            query: GET_MY_SUPPLIERS_Business,
            variables: {
              first: parseInt(size),
              page: activePage,
              search: "",
              ordered_by: [
                {
                  column: "CREATED_AT",
                  order: "DESC",
                },
              ],
            },
          },
          (data) => {
            return {
              myBusinesses: {
                ...data.myBusinesses,
                data: [createSupplierBusiness, ...data.myBusinesses.data],
              },
            };
          }
        );
      },
    }
  );

  const { height } = useViewportSize();
  const submit = () => {
    const geoLocation =
      location && Object.keys(location).length > 0
        ? { lat: +location.lat, lng: +location.lng }
        : { lat: center.lat, lng: center.lng };
    let variables = {
      business_name: form.getInputProps("business_name").value,
      business_email: form.getInputProps("business_email").value,
      business_phone_number: form.getInputProps("business_phone_number").value,
      business_website: form.getInputProps("business_website").value,
      business_type: form.getInputProps("business_type").value,
      business_region_id: form.getInputProps("business_region_id").value,
      business_zone: form.getInputProps("business_zone").value,
      business_woreda: form.getInputProps("business_woreda").value,
      business_kebele: form.getInputProps("business_kebele").value,
      business_geo_location: geoLocation,
      owner_firstname: form.getInputProps("owner_firstname").value,
      owner_middlename: form.getInputProps("owner_middlename").value,
      owner_lastname: form.getInputProps("owner_lastname").value,
      owner_phone_number: form.getInputProps("owner_phone_number").value,
      owner_id_type: form.getInputProps("owner_id_type").value,
      tin: form.getInputProps("tin").value,
      number_of_warehouses: parseInt(form.getInputProps("number_of_warehouses").value),
      business_registration_number: form.getInputProps(
        "business_registration_number"
      ).value,
      owner_id: files.owner_id[0],
      tin_certification_document: files.tin_certification_document[0],
      trade_license_document: files.trade_license_document[0],
    };
    createSupplierBusiness({
      variables,
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Supplier Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Supplier Not Created Successfully!";
        if (error?.graphQLErrors?.length) {
          const graphQLError = error.graphQLErrors[0];
          const debugMessage = graphQLError?.debugMessage || "";
          const validationErrors = graphQLError?.extensions?.validation;

          if (validationErrors) {
            errorMessage = Object.values(validationErrors).flat().join(", ");
          } else {
            errorMessage = debugMessage || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
  };

  const [files, setFiles] = useState({
    owner_id: [],
    tin_certification_document: [],
    trade_license_document: [],
  });

  const fileInputRefs = {
    owner_id: useRef(null),
    tin_certification_document: useRef(null),
    trade_license_document: useRef(null),
  };

  const handleFileChange = (event, fileType) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: Array.from(event.target.files),
    }));
  };

  const FilePreview = ({ fileList }) => {
    const previews = useMemo(() => {
      return fileList.map((file, index) => {
        const fileUrl = URL.createObjectURL(file);

        return (
          <div key={index} style={{ margin: "0 auto" }}>
            {file.type === "application/pdf" ? (
              <embed
                src={fileUrl}
                width="130"
                height="160"
                type="application/pdf"
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            ) : (
              <img
                src={fileUrl}
                alt=""
                width="130"
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            )}
          </div>
        );
      });
    }, [fileList]);

    return (
      <SimpleGrid
        cols={3}
        spacing="md"
        style={{ maxHeight: "200px", overflowY: "auto" }} // Added fixed height and scroll
      >
        {previews}
      </SimpleGrid>
    );
  };
  const [activeTab, setActiveTab] = useState("business-info");
  const tabList = [
    "business-info",
    "business-address",
    "business-owner",
    "business-documents",
  ];
  const nextTab = () => {
    if (!validateCurrentTab()) return;

    const currentIndex = tabList.indexOf(activeTab);
    if (currentIndex < tabList.length - 1) {
      setActiveTab(tabList[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentIndex = tabList.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabList[currentIndex - 1]);
    }
  };
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("business_region_id", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={supplierLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Tabs
            value={activeTab}
            onTabChange={setActiveTab}
            defaultValue="business-info"
          >
            <Tabs.List>
              <Tabs.Tab value="business-info">Business Information</Tabs.Tab>
              <Tabs.Tab value="business-address">Business Address</Tabs.Tab>
              <Tabs.Tab value="business-owner">
                Business Owner Information
              </Tabs.Tab>
              <Tabs.Tab value="business-documents">Business Documents</Tabs.Tab>
            </Tabs.List>

            {/* Business Information Tab */}
            <Tabs.Panel value="business-info">
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Business Name"
                    placeholder="Business Name"
                    {...form.getInputProps("business_name")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    label="Business Email"
                    placeholder="Business Email"
                    {...form.getInputProps("business_email")}
                  />
                </Grid.Col>

                <Grid.Col span={4}>
                  <Select
                    required
                    data={["MANUFACTURER", "WHOLESALER", "DISTRIBUTOR"]}
                    label="Business Type"
                    {...form.getInputProps("business_type")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Business Phone Number"
                    placeholder="Business Phone Number"
                    {...form.getInputProps("business_phone_number")}
                  />
                </Grid.Col>

                <Grid.Col span={4}>
                  <TextInput
                    label="Business Website"
                    placeholder="Business Website"
                    {...form.getInputProps("business_website")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    type="number"
                    label="Number of Warehouses"
                    placeholder="Number of Warehouses"
                    {...form.getInputProps("number_of_warehouses")}
                  />
                </Grid.Col>

                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="TIN"
                    placeholder="Tax Identification Number"
                    {...form.getInputProps("tin")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Business Registration Number"
                    placeholder="Business Registration Number"
                    {...form.getInputProps("business_registration_number")}
                  />
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="business-address">
              <Grid>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Zone"
                    placeholder="Zone"
                    {...form.getInputProps("business_zone")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Woreda"
                    placeholder="Woreda"
                    {...form.getInputProps("business_woreda")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Kebele"
                    placeholder="Kebele"
                    {...form.getInputProps("business_kebele")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    required
                    searchable
                    data={regionsDropDownData}
                    value={form.getInputProps("business_region_id")?.value}
                    onChange={setRegionDropDownValue}
                    label="Region"
                    placeholder="Pick a region this Busines belongs to"
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  {isLoaded && (
                    <Autocomplete
                      onLoad={autocompleteLoadHandler}
                      onPlaceChanged={onPlaceChangedHandler}
                    >
                      <TextInput
                        required
                        label="Location"
                        placeholder="Location"
                        {...form.getInputProps("location")}
                      />
                    </Autocomplete>
                  )}
                  </Grid.Col>
                  <Grid.Col span={6}>

                  <ScrollArea style={{marginTop:"10px", height: "auto" }}>
                    {isLoaded ? (
                      <GoogleMap
                      
                        center={center}
                        zoom={14}
                        mapContainerStyle={containerStyle}
                        onLoad={mapLoadHandler}
                        onClick={() =>
                          mapRef && setCenter(mapRef.getCenter().toJSON())
                        }
                      >
                        <MarkerF
                          position={center}
                          draggable
                          onDragEnd={(a) => setLocation(a.latLng.toJSON())}
                        />
                      </GoogleMap>
                    ) : (
                      <Loader />
                    )}
                  </ScrollArea>
                </Grid.Col>
             
              </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="business-owner">
              <Grid>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="First Name"
                    placeholder="First Name"
                    {...form.getInputProps("owner_firstname")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    label="Middle Name"
                    placeholder="Middle Name"
                    {...form.getInputProps("owner_middlename")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    required
                    label="Last Name"
                    placeholder="Last Name"
                    {...form.getInputProps("owner_lastname")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    required
                    data={["Kebele Id", "Driving License"]}
                    label="Owner ID Type"
                    {...form.getInputProps("owner_id_type")}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <div style={{ flex: "1 1 5%", margin: "5px" }}>
                    <Button
                      onClick={() => fileInputRefs.owner_id.current.click()}
                      style={{
                        width: "70%",
                        backgroundColor: "#FF6A00",
                        color: "#FFFFFF",
                      }}
                    >
                      Upload Owner Id
                    </Button>
                    {fileErrors.owner_id && (
                      <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                        {fileErrors.owner_id}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRefs.owner_id}
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        handleFileChange(event, "owner_id");
                        setFileErrors((prev) => ({ ...prev, owner_id: "" }));
                      }}
                    />
                    <FilePreview fileList={files.owner_id} />
                  </div>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="business-documents">
              <Grid>
                <Grid.Col span={4}>
                  <div style={{ flex: "1 1 5%", margin: "5px" }}>
                    <Button
                      onClick={() =>
                        fileInputRefs.tin_certification_document.current.click()
                      }
                      style={{
                        width: "70%",
                        backgroundColor: "#FF6A00",
                        color: "#FFFFFF",
                      }}
                    >
                      Upload Tin Certification Document
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRefs.tin_certification_document}
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={(event) =>
                        handleFileChange(event, "tin_certification_document")
                      }
                    />
                    <FilePreview fileList={files.tin_certification_document} />
                  </div>
                </Grid.Col>
                <Grid.Col span={4}>
                  <div style={{ flex: "1 1 5%", margin: "5px" }}>
                    <Button
                      onClick={() =>
                        fileInputRefs.trade_license_document.current.click()
                      }
                      style={{
                        width: "70%",
                        backgroundColor: "#FF6A00",
                        color: "#FFFFFF",
                      }}
                    >
                      Upload Trade License
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRefs.trade_license_document}
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={(event) =>
                        handleFileChange(event, "trade_license_document")
                      }
                    />
                    <FilePreview fileList={files.trade_license_document} />
                  </div>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
          </Tabs>
          <Grid>
            <Grid.Col span={12}>
              <Button
                onClick={prevTab}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                disabled={activeTab === "business-info"}
              >
                Previous
              </Button>

              {activeTab === "business-documents" ? (
                <Button
                  style={{
                    marginLeft: "10px",
                    marginTop: "10px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  type="submit"
                  disabled={
                    !files.tin_certification_document.length ||
                    !files.trade_license_document.length
                  }
                >
                  Submit
                </Button>
              ) : (
                <Button
                  style={{
                    marginLeft: "14px",
                    marginTop: "10px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  onClick={nextTab}
                >
                  Next
                </Button>
              )}
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
};

export default SupplierBusinessAddModal;
