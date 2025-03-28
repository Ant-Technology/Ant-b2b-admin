import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { UPDATE_WARE_HOUSE } from "apollo/mutuations";
import ContentLoader from "react-content-loader";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import {
  GET_MY_SUPPLIERS_Business,
  GET_REGIONS,
  GET_SUPPLIERS,
} from "apollo/queries";

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

const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk"; // Your Google API Key
const libraries = ["places"];

const CategoryEditModal = ({ setOpenedEdit, editId, loading }) => {
  const [location, setLocation] = useState({});
  const [center, setCenter] = useState({ lat: 8.9999645, lng: 38.7700539 });
  const [autocomplete, setAutocomplete] = useState();
  const [mapRef, setMapRef] = useState(null);
  const [areasDropDownData, setAreasDropDownData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const hasAdminPermission = roles.some((permission) => permission === "admin");
  const [regions, setRegions] = useState([]);
  const [business, setBusiness] = useState([]);

  const { loading: supplierLoading } = useQuery(GET_SUPPLIERS, {
    variables: {
      first: parseInt(1000),
      page: 1,
      search: "",
    },

    onCompleted(data) {
      const arr = data.suppliers.data.map((item) => ({
        label: item.user?.name,
        value: item.id,
      }));

      setSuppliers(arr);
    },
  });

  const { loading: businessLoading } = useQuery(GET_MY_SUPPLIERS_Business, {
    variables: {
      first: parseInt(1000),
      page: 1,
      search: "",
      ordered_by: [
        {
          column: "CREATED_AT",
          order: "DESC",
        },
      ],
    },

    onCompleted(data) {
      const arr = data.myBusinesses.data.map((item) => ({
        label: item.business_name,
        value: item.id,
      }));

      setBusiness(arr);
    },
  });
  useEffect(() => {
    if (location && Object.keys(location).length > 0) {
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
      form.setFieldValue("specific_area", autocomplete.getPlace().name);
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
      name: "",
      region: { connect: "1" }, // Initialized correctly
      specific_area: "",
      supplier_id: 1,
    },
  });

  const [regionsDropDownData, setRegionsDropDownData] = useState([]);

  // GraphQL queries
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      const regions = data.regions.data.map((region) => ({
        label: region?.name,
        value: region?.id,
      }));
      setRegionsDropDownData(regions);
      setRegions(data.regions.data);
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
    if (editId) {
      form.setValues({
        name: editId?.name,
        specific_area: editId?.specific_area,
        region: { connect: editId.region?.id },
        supplier_id:editId.supplier?.id
      });
      setLocation(editId?._geo);
    }
  }, [editId]);
  // Mutation
  const [editWarehouse] = useMutation(UPDATE_WARE_HOUSE);

  const { height } = useViewportSize();

  const submit = () => {
    let variables = {
      id: editId.id,
      name: form.values.name,
      _geo: {
        lat: +location.lat,
        lng: +location.lng,
      },
      region: { connect: form.values.region.connect }, // Accessing the region value correctly
      specific_area: form.values.specific_area,
      supplier_id :form
        .getInputProps("supplier_id")
        .value.toString()
    };
    
    editWarehouse({
      variables,
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Warehouse Edited Successfully",
        });
        form.reset();
        setOpenedEdit(false);
      },
      onError() {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while editing warehouse",
        });
      },
    });
  };

  const setRegionDropDownValue = (val) => {
    form.setFieldValue("region.connect", val);
    const region = regions.find((item) => item.id === val);
    const parsedSpecificAreas = JSON.parse(region.specific_areas);
    setAreasDropDownData(parsedSpecificAreas); // Correctly set the path
  };
  const setAreasDropDownValue = (val) => {
    //
    form.setFieldValue("specific_area", val);
    form.setFieldValue("location", val);
  };
  const handleSupplierChange = (val) => {
    form.setFieldValue("supplier_id", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                searchable
                data={business}
                value={form.getInputProps("supplier_id").value.toString()}
                onChange={handleSupplierChange}
                label="Supplier"
                placeholder="Pick a supplier business this belongs to"
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}>
              <Select
                data={regionsDropDownData}
                value={form.values.region.connect} // Access the value directly from form values
                onChange={setRegionDropDownValue}
                label="Region"
                placeholder="Pick a region this retailer belongs to"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                required
                data={areasDropDownData}
                value={form.getInputProps("specific_area")?.value}
                onChange={setAreasDropDownValue}
                label="Specific Area"
                placeholder="Pick a Specific Area this Warehouse belongs to"
              />
            </Grid.Col>
          </Grid>
          <Grid>
            {isLoaded && (
              <Grid.Col span={6}>
                <Autocomplete
                  onLoad={autocompleteLoadHandler}
                  onPlaceChanged={onPlaceChangedHandler}
                >
                  <TextInput
                    required
                    label="Specific Area"
                    placeholder="Specific Area"
                    {...form.getInputProps("specific_area")}
                  />
                </Autocomplete>
              </Grid.Col>
            )}
          </Grid>
          <Grid style={{ marginTop: "10px" }}>
            <Grid.Col span={12}>
              <ScrollArea style={{ height: "auto" }}>
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

          <Grid>
            <Grid.Col span={12}>
              <Button
                type="submit"
                style={{
                  marginTop: "10px",
                  width: "20%",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                fullWidth
                color="blue"
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
};

export default CategoryEditModal;
