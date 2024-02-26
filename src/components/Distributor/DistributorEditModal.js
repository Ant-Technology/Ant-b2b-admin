import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import Map from "components/utilities/Map";
import { UPDATE_DISTRIBUTOR } from "apollo/mutuations";
import { customLoader } from "components/utilities/loader";
import { GET_DISTRIBUTOR } from "apollo/queries";

const DistributorEditModal = ({ editId, setOpenedEdit }) => {
  // state variable to handle map location
  const [location, setLocation] = useState({});
  // form state
  const form = useForm({});

  // mutation
  const [updateDistributor, { loading: distributorLoading }] =
    useMutation(UPDATE_DISTRIBUTOR);

  // queries
  const { loading } = useQuery(GET_DISTRIBUTOR, {
    variables: { id: editId },
    onCompleted(data) {
      form.setValues({
        name: data.distributor.name,
        _geo: {
          lat: data.distributor._geo.lat,
          lng: data.distributor._geo.lng,
        },
        contact_name: data.distributor.contact_name,
        contact_phone: data.distributor.contact_phone,
        address: data.distributor.address,
        city: data.distributor.city,
      });
      // set the location on the map
      setLocation({ ...data.distributor._geo });
    },
  });

  const { height } = useViewportSize();

  const submit = () => {
    updateDistributor({
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
          message: "Distributor Created Successfully",
        });
        form.reset();

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Distributor Not Created Successfully",
        });
      },
    });
    // e.preventDefault();
  };

  return (
    <>
      <LoadingOverlay
        visible={loading || distributorLoading}
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
                  <Map setLocation={setLocation} location={location} />
                </ScrollArea>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
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

export default DistributorEditModal;
