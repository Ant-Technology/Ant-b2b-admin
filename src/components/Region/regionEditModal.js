import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Tabs,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { Photo } from "tabler-icons-react";
import { tabList } from "components/utilities/tablist";
import { customLoader } from "components/utilities/loader";
import Map from "components/utilities/Map";
import { UPDATE_REGION } from "apollo/mutuations";
import { GET_REGION } from "apollo/queries";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";

// TODO: change map key env variable

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
//AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk
const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";
const libraries = ["places"];
const RegionEditModal = ({ editId, setOpenedEdit }) => {
  const [center, setCenter] = useState({ lat: 8.9999645, lng: 38.7700539 });
  const [autocomplete, setAutocomplete] = useState();
  const [mapRef, setMapRef] = useState(null);
  const [location, setLocation] = useState({});
  useEffect(() => {
    if (
      location &&
      Object.keys(location) &&
      Object.keys(location)?.length > 0
    ) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);
  console.log("Center", center);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const mapLoadHandler = (map) => {
    setMapRef(map);
  };

  const onPlaceChangedHandler = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      console.log(place);
      if (place?.geometry && place?.geometry.location) {
        const { lat, lng } = place.geometry.location;
        setCenter({ lat: lat(), lng: lng() });
        setLocation({ lat: lat(), lng: lng() });
        // Set the form values
        form.setValues({
          ...form.values,
          name: { en: place.name, am: "" }, // English name from place.name, Amharic name is empty
        });
      }
    }
  };

  const autocompleteLoadHandler = (autocomplete) => {
    console.log(autocomplete.getPlace());
    setAutocomplete(autocomplete);
  };
  // mutation
  const [updateRegion, { loading: regionLoading }] = useMutation(UPDATE_REGION);

  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);

  // form state
  const form = useForm({});

  const { loading } = useQuery(GET_REGION, {
    variables: { id: editId },
    onCompleted(data) {
      form.setValues({
        name: {
          am: data.region.name_translations.am,
          en: data.region.name_translations.en,
        },
        _geo: {
          lat: data.region._geo.lat,
          lng: data.region._geo.lng,
        },
      });
      // set the location on the map
      setLocation({ ...data.region._geo });
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { height } = useViewportSize();

  const submit = () => {
    if (activeTab === tabList[tabList.length - 1].value) {
      updateRegion({
        variables: {
          id: editId,
          name: form.getInputProps("name").value,
          _geo: {
            lat: +location.lat,
            lng: +location.lng,
          },
        },
        onCompleted(data) {
          showNotification({
            color: "green",
            title: "Success",
            message: "Region updated Successfully",
          });

          setActiveTab(tabList[0].value);

          setOpenedEdit(false);
        },
        onError(error) {
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Region Not updated Successfully",
          });
        },
      });
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
    // e.preventDefault();
  };

  return (
    <>
      <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
        <LoadingOverlay
          visible={loading || regionLoading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Tabs.List>
          {tabList.map((tab, i) => {
            return (
              <Tabs.Tab key={i} value={tab.value} icon={<Photo size={14} />}>
                {tab.name}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        <ScrollArea
          style={{ height: height / 1.5 }}
          type="auto"
          offsetScrollbars
        >
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Stack>
            <Grid>
              {isLoaded && (
                <Grid.Col span={6}>
                  <Autocomplete
                    onLoad={autocompleteLoadHandler}
                    onPlaceChanged={onPlaceChangedHandler}
                  >
                    <TextInput
                      required
                      label="Name"
                      placeholder="Region Name"
                      {...form.getInputProps("name." + "en")}
                    />
                  </Autocomplete>
                </Grid.Col>
              )}
              <Grid.Col span={6}></Grid.Col>
            </Grid>
          </Stack>

          <Grid style={{ marginTop: "10px", marginBottom: "20px" }}>
            <Grid.Col span={4}>
              <Button
                style={{ display: activeTab === 1 ? "none" : "" }}
                type="submit"
                color="blue"
                variant="outline"
                fullWidth
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </form>
        </ScrollArea>
      </Tabs>
    </>
  );
};

export default RegionEditModal;
