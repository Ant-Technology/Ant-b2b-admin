import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { UPDATE_VEHICLE_TYPE } from "apollo/mutuations";
import { GET_VEHICLE_TYPE } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { tabList } from "components/utilities/tablist";
import React, { useEffect, useRef, useState } from "react";
import { Photo } from "tabler-icons-react";

const VehicleTypeEditModal = ({ setOpenedEdit, editId }) => {
  const form = useForm({});
  const [updateVehicleType] = useMutation(UPDATE_VEHICLE_TYPE);
  const [typeDropDownData, setTypeDropDownData] = useState([]);
  const [file, setFile] = useState(null); // To store the uploaded image
  const fileInputRef = useRef(null); // Ref for the file input

  const previews = file
    ? [
        <img
          key={0}
          src={URL.createObjectURL(file)}
          alt="Preview"
          width="130"
          onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
        />,
      ]
    : null;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set the uploaded image
  };

  useEffect(() => {
    let types = ["Shipment", "Dropoff"];
    let type = [];

    types.forEach((item) => {
      type.push({
        label: item,
        value: item,
      });
    });

    setTypeDropDownData([...type]);
  }, []);

  const { loading } = useQuery(GET_VEHICLE_TYPE, {
    variables: { id: editId },
    onCompleted(data) {
      form.setValues({
        id: editId,
        starting_price: data.vehicleType.starting_price,
        price_per_kilometer: data.vehicleType.price_per_kilometer,
        type: data.vehicleType.type,
        title: {
          am: data.vehicleType.title_translations.am,
          en: data.vehicleType.title_translations.en,
        },
      });
    },
  });

  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const { height } = useViewportSize();

  const submit = () => {
    if (activeTab === tabList[tabList.length - 1].value) {
      updateVehicleType({
        variables: {
          id: form.getInputProps("id").value,
          type: form.getInputProps("type").value,
          starting_price: parseFloat(form.values.starting_price),
          price_per_kilometer: parseFloat(form.values.price_per_kilometer),
          title: {
            am: form.getInputProps("title.am").value,
            en: form.getInputProps("title.en").value,
          },
          image: file, // Include the image in the mutation
        },
        onCompleted() {
          showNotification({
            color: "green",
            title: "Success",
            message: "Vehicle type edited successfully",
          });
          form.reset();
          setOpenedEdit(false);
        },
        onError(err) {
          showNotification({
            color: "red",
            title: "Error",
            message: `${err}`,
          });
        },
      });
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
  };

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
        {tabList.map((tab, i) => (
          <Tabs.Tab key={i} value={tab.value} icon={<Photo size={14} />}>
            {tab.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          {tabList.map((tab, i) => (
            <Tabs.Panel key={i} value={tab.value} pt="xs">
              <Stack>
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      required
                      label={tab.label}
                      placeholder={tab.placeHolder}
                      {...form.getInputProps("title." + tab.shortHand)}
                    />
                    <Select
                      data={typeDropDownData}
                      value={form.getInputProps("type")?.value?.toString()}
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
                </Grid>
                <Grid>
                  <Grid.Col span={12}>
                    <div>
                      <Button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          marginTop: "5px",
                          width: "20%",
                          backgroundColor: "#FF6A00",
                          color: "#FFFFFF",
                        }}
                        fullWidth
                        color="blue"
                      >
                        Upload Image
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <SimpleGrid
                        cols={4}
                        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                        mt={previews?.length > 0 ? "xl" : 0}
                      >
                        {previews}
                      </SimpleGrid>
                    </div>
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
              </Stack>
            </Tabs.Panel>
          ))}
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default VehicleTypeEditModal;
