import { useMutation } from "@apollo/client";
import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Tabs,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_VEHICLE_TYPE } from "apollo/mutuations";
import { GET_VEHICLE_TYPES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { tabList } from "components/utilities/tablist";
import React, { useEffect, useState } from "react";
import { Photo, PictureInPicture, Upload } from "tabler-icons-react";

const VehicleTypeAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [files, setFiles] = useState([]);
  const [typeDropDownData, setTypeDropDownData] = useState([]);

  useEffect(() => {
    let types = ["Shipment", "Dropoff"];
    let type = [];

    // loop over regions data to structure the data for the use of drop down
    types.forEach((item, index) => {
      type.push({
        label: item,
        value: item,
      });
    });

    // put it on the state
    setTypeDropDownData([...type]);
  }, []);
  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        key={index}
        src={imageUrl}
        alt=""
        width="130"
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

  const theme = useMantineTheme();
  //form initialization and validation
  const form = useForm({
    initialValues: {
      title: { en: "", am: "" },
      starting_price: "",
      price_per_kilometer: "",
      type: "",
    },
  });

  const [addVehicleType, { loading }] = useMutation(CREATE_VEHICLE_TYPE, {
    update(cache, { data: { createVehicleType } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLE_TYPES,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.vehicleTypes.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              vehicleTypes: {
                data: [createVehicleType, ...data.vehicleTypes.data],
              },
            };
          }
        }
      );
    },
  });

  const submit = () => {
    if (activeTab === tabList[tabList.length - 1].value) {
      addVehicleType({
        variables: {
          title: form.getInputProps("title").value,
          type: form.getInputProps("type").value,
          starting_price: parseFloat(form.values.starting_price),
          price_per_kilometer: parseFloat(form.values.price_per_kilometer),
        },
        onCompleted() {
          showNotification({
            color: "green",
            title: "Success",
            message: "Vehicle Type Created Successfully",
          });
          setOpened(false);
        },
        onError(error) {
          showNotification({
            color: "red",
            title: "Error",
            message: `${error}`,
          });
        },
      });
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
  };

  const { height } = useViewportSize();
  const setTypeDropDownValue = (val) => {
    form.setFieldValue("type", val);
  };

  return (
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading}
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
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          {/* mapping the tablist */}
          {tabList.map((tab, i) => {
            return (
              <Tabs.Panel key={i} value={tab.value} pt="xs">
                <Grid grow>
                  <Grid.Col span={6}>
                    <Grid.Col span={4}>
                      <TextInput
                        required
                        label={tab.label}
                        placeholder={tab.placeHolder}
                        {...form.getInputProps("title." + tab.shortHand)}
                      />
                      <Select
                        data={typeDropDownData}
                        value={form.getInputProps("type")?.value.toString()}
                        onChange={setTypeDropDownValue}
                        label="Type"
                        placeholder="Pick a Type this Vehicle Type belongs to"
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput
                        required
                        label="Starting Price"
                        placeholder="Starting Price"
                        type="number"
                        {...form.getInputProps("starting_price")}
                      />
                      <TextInput
                        required
                        label="Price Per Kilometer"
                        placeholder="Price Per Kilometer"
                        type="number"
                        {...form.getInputProps("price_per_kilometer")}
                      />
                    </Grid.Col>

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

export default VehicleTypeAddModal;
