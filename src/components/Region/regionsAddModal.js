import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Tabs,
  LoadingOverlay,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { Photo } from "tabler-icons-react";
import { tabList } from "components/utilities/tablist";
import { customLoader } from "components/utilities/loader";
import Map from "components/utilities/Map";
import { CREATE_REGIONS } from "apollo/mutuations";
import { GET_REGIONS } from "apollo/queries";

const RegionsAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // mutation
  const [addRegion, { loading: regionLoading }] = useMutation(CREATE_REGIONS, {
    update(cache, { data: { createRegion } }) {
      cache.updateQuery(
        {
          query: GET_REGIONS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.regions.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              regions: {
                data: [createRegion, ...data.regions.data],
              },
            };
          }
        }
      );
    },
  });

  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);

  // state variable to handle map location
  const [location, setLocation] = useState({});

  // form state
  const form = useForm({
    initialValues: {
      name: { en: "", am: "" },
      _geo: { lat: "", lng: "" },
    },
  });

  const { height } = useViewportSize();

  const submit = () => {
    if (activeTab === tabList[tabList.length - 1].value) {
      addRegion({
        variables: {
          name: form.values.name,
          _geo: {
            lat: +location.lat,
            lng: +location.lng,
          },
        },

        onCompleted(data) {
          showNotification({
            color: "green",
            title: "Success",
            message: "Region Created Successfully",
          });
          setActiveTab(tabList[0].value);
          setOpened(false);
        },
        onError(error) {
          setOpened(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Region Not Created Successfully",
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
          visible={regionLoading}
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
                  <Map setLocation={setLocation} />
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

export default RegionsAddModal;
