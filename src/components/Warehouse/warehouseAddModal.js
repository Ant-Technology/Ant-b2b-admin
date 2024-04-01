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
import React, { useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import Map from "components/utilities/Map";
import { customLoader } from "components/utilities/loader";
import { CREATE_WARE_HOUSE } from "../../apollo/mutuations";
import { GET_REGIONS, GET_WARE_HOUSES } from "../../apollo/queries";

export default function WarehouseAddModal({
  trigger,
  total,
  setTotal,
  setOpened,
  activePage,
  setActivePage,
}) {
  const [location, setLocation] = useState({});

  //form initialization and validation
  const form = useForm({
    initialValues: {
      name: "",
      _geo: {
        lat: "",
        lng: "",
      },
      regionId: "", // Provide the default region ID here
    },
  });
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);

  // graphql queries
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];

      // loop over regions data to structure the data for the use of drop down
      regions.data.forEach((region, index) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });

      // put it on the state
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
  const [createWarehouse, { loading }] = useMutation(CREATE_WARE_HOUSE, {
    update(cache, { data: { createWarehouse } }) {
      cache.updateQuery(
        {
          query: GET_WARE_HOUSES,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.warehouses.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              warehouses: {
                data: [createWarehouse, ...data.warehouses.data],
              },
            };
          }
        }
      );
    },
  });
  
  const submit = () => {
    createWarehouse({
      variables: {
        name: form.getInputProps("name").value,
        regionId: form.getInputProps("regionId").value, // Provide the regionId variable
        _geo: {
          lat: +location.lat,
          lng: +location.lng,
        },
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Warehouse Created Successfully",
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
  };

  const { height } = useViewportSize();
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("regionId", val);
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
                label="name"
                placeholder="name"
                {...form.getInputProps("name")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              {" "}
              <Select
                data={regionsDropDownData}
                value={form.getInputProps("regionId")?.value}
                onChange={setRegionDropDownValue}
                label="Region"
                placeholder="Pick a region this retailer belongs to"
              />
            </Grid.Col>
          </Grid>
          <Grid style={{ marginTop: "10px" }}>
            <Grid.Col span={12}>
              <ScrollArea style={{ height: "auto" }}>
                <Map setLocation={setLocation} />
              </ScrollArea>
            </Grid.Col>
          </Grid>
          <Grid style={{ marginTop: "10px", marginBottom: "20px" }}>
            <Grid.Col span={4}>
              <Button type="submit" color="blue" variant="outline" fullWidth>
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
}
