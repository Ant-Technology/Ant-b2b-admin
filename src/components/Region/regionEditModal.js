import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Tabs,
  LoadingOverlay,
} from "@mantine/core";
import {  useState } from "react";
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

const RegionEditModal = ({ editId, setOpenedEdit }) => {
  // mutation
  const [updateRegion, { loading: regionLoading }] = useMutation(UPDATE_REGION);

  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);

  // state variable to handle map location
  const [location, setLocation] = useState({});

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
      });    },
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
          style={{ height: height / 0.5 }}
          type="auto"
          offsetScrollbars
        >
          <form onSubmit={form.onSubmit(() => submit())}>
            {tabList.map((tab, i) => {
              return (
                <Tabs.Panel key={i} value={tab.value} pt="xs">
                  <Stack>
                    <Grid>
                      <Grid.Col span={6}>
                        <TextInput
                          required
                          label="Name"
                          placeholder="Region Name"
                          {...form.getInputProps("name." + tab.shortHand)}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}></Grid.Col>
                    </Grid>
                  </Stack>
                </Tabs.Panel>
              );
            })}
            <Grid style={{ marginTop: "10px" }}>
              <Grid.Col span={12}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map setLocation={setLocation} location={location} />
                </ScrollArea>
              </Grid.Col>
            </Grid>
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
