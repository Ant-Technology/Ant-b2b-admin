import {
  TextInput,
  Grid,
  Text,
  Stack,
  ScrollArea,
  Button,
  ActionIcon,
  Tabs,
  LoadingOverlay,
  Group,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
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
      children: [],
    },
  });

  const { height } = useViewportSize();
  const handleFields = (value) => {
    let fields = form.values.children.map((item, index) => {
      return (
        <Group key={item.key} mt="xs">
          <TextInput
            required
            label={`Specific  Area ${index + 1}`}
            sx={{ flex: 1 }}
            {...form.getInputProps(
              value === "am"
                ? `children.${index}.name.am`
                : `children.${index}.name.en`
            )}
          />
          <ActionIcon
            color="#ed522f"
            onClick={() => form.removeListItem("children", index)}
            style={{ marginTop: "30px", padding: "2px" }}
          >
            <Trash size={24} />
          </ActionIcon>
        </Group>
      );
    });

    return fields;
  };

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
    //mapping the header icon and title
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
      <ScrollArea>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          {/* mapping the tablist */}
          {tabList.map((tab, i) => {
            return (
              <Tabs.Panel style={{marginRight:"20px"}} key={i} value={tab.value} pt="xs">
                <Grid grow>
                  <Grid.Col span={6}>
                    <Grid.Col span={4}>
                      <TextInput
                        required
                        label={tab.label}
                        placeholder={tab.placeHolder}
                        {...form.getInputProps("name." + tab.shortHand)}
                      />
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <Button
                        style={{
                          display: activeTab === 1 ? "none" : "",
                          marginTop: "15px",
                          width: "25%",
                          backgroundColor: "rgba(244, 151, 3, 0.8)",
                          color: "rgb(20, 61, 89)",
                        }}
                        type="submit"
                      >
                        Submit
                      </Button>
                    </Grid.Col>
                  </Grid.Col>

                  <Grid.Col span={6}>
                  <ScrollArea
                      style={{ height: height / 1.8 }}
                      type="auto"
                      offsetScrollbars
                    >
                      {handleFields(tab.shortHand).length > 0 ? (
                        <Group mb="xs"></Group>
                      ) : (
                        <Text color="dimmed" align="center">
                          No specific Added Yet...
                        </Text>
                      )}

                      {handleFields(tab.shortHand)}

                      <Group position="center" mt="md">
                        <Button
                          color="blue"
                          variant="outline"
                          fullWidth
                          onClick={() =>
                            form.insertListItem("children", {
                              name: { en: "", am: "" },
                            })
                          }
                        >
                          Add New Specific Area
                        </Button>
                      </Group>
                  </ScrollArea>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
            );
          })}
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default RegionsAddModal;
