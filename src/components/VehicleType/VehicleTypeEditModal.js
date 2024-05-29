import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Select,
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
import React, { useEffect, useState } from "react";
import { Photo } from "tabler-icons-react";

const VehicleTypeEditModal = ({ setOpenedEdit, editId }) => {
  const form = useForm({});

  const [updateVehicleType] = useMutation(UPDATE_VEHICLE_TYPE);
  const [typeDropDownData, setTypeDropDownData] = useState([]);

  useEffect (()=>{
   let types =  ["Shipment", "Dropoff"] ;
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
  },[])

  const { loading } = useQuery(GET_VEHICLE_TYPE, {
    variables: { id: editId },
    onCompleted(data) {
      form.setValues({
        id: editId,
        starting_price:data.vehicleType.starting_price,
        price_per_kilometer: data.vehicleType.price_per_kilometer,
        type: data.vehicleType.type,
        title: {
          am: data.vehicleType.title_translations.am,
          en: data.vehicleType.title_translations.en,
        },
      });
    },
  });
  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [file, setFile] = useState([]);
  const { height } = useViewportSize();

  const submit = () => {
    // return;
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
        },

        update(cache, data) {
          // const { categories } = cache.readQuery({ query: GET_CATEGORIES });
        },

        onCompleted() {
          showNotification({
            color: "green",
            title: "Success",
            message: "Vehicle type edited successfully",
          });
          // refetch();
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

export default VehicleTypeEditModal;
