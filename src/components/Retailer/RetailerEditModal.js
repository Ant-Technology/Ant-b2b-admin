import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import React, {  useState } from "react";
import {  useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_RETAILER } from "apollo/mutuations";
import { GET_RETAILER } from "apollo/queries";
import Map from "components/utilities/Map";

const RetailerEditModal = ({
  editId,
  setOpenedEdit,
}) => {
  // state variable to handle map location
  const [location, setLocation] = useState({});
  // form state
  const form = useForm({});

  // mutation
  const [updateRetailer, { loading: retailerLoading }] =
    useMutation(UPDATE_RETAILER);


  const { loading } = useQuery(GET_RETAILER, {
    variables: { id: editId },
    onCompleted(data) {
      form.setValues({
        name: data.retailer.name,
        _geo: {
          lat: data.retailer._geo.lat,
          lng: data.retailer._geo.lng,
        },
        contact_name: data.retailer.contact_name,
        contact_phone: data.retailer.contact_phone,
        address: data.retailer.address,
        city: data.retailer.city,
      });
      // set the location on the map
      setLocation({ ...data.retailer._geo });
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
    updateRetailer({
      variables: {
        id: editId,
        name: form.values.name,
        _geo: {
          lat: +location.lat,
          lng: +location.lng,
        },
        address: form.values.address,
        contact_name: form.values.contact_name,
        contact_phone: form.values.contact_phone,
        city: form.values.city,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Retailer Created Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Retailer Not Created Successfully",
        });
      },
    });
    // e.preventDefault();
  };



  return (
    <>
      <LoadingOverlay
        visible={loading || retailerLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Name"
                  placeholder="Name"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  required
                  label="Address"
                  placeholder="Address"
                  {...form.getInputProps("address")}
                />
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Contact Name"
                  placeholder="Contact Name"
                  {...form.getInputProps("contact_name")}
                />
                <TextInput
                  required
                  label="Contact Phone"
                  placeholder="Phone"
                  {...form.getInputProps("contact_phone")}
                />
              </Grid.Col>
            </Grid>
            {/* user */}

            <Grid>
              <Grid.Col span={12}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map setLocation={setLocation} location={location}/>
                </ScrollArea>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <Button
                  style={{
                    width: "25%",
                    marginTop: "15px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  type="submit"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </>
  );
};

export default RetailerEditModal;
