import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { UPDATE_WARE_HOUSE } from "apollo/mutuations";
import Map from "components/utilities/Map";

const CategoryEditModal = ({
  setOpenedEdit,
  editId,
  getWarehouse,
  loading,
}) => {
  const [location, setLocation] = useState({});
  //form initialization and validation
  const form = useForm({
    name: "",
  });

  useEffect(() => {
    if (editId) {
      getWarehouse({
        variables: { id: editId },
        onCompleted(data) {
          form.setValues({
            name: data.warehouse.name,
          });
          setLocation({ ...data.warehouse._geo });
        },
      });
    }
    // eslint-disable-next-line
  }, []);

  // mutation
  const [editWarehouse] = useMutation(UPDATE_WARE_HOUSE);

  const { height } = useViewportSize();

  const submit = () => {
    editWarehouse({
      variables: {
        id: editId,
        input: {
          name: form.getInputProps("name").value,
          _geo: {
            lat: +location.lat,
            lng: +location.lng,
          },
        },
      },
   
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Category Edited Successfully",
        });
        // refetch();
        form.reset();
        setOpenedEdit(false);
      },
    });
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
          <Grid grow>
            <Grid.Col span={6}>
              <Grid.Col span={4}>
                <TextInput
                  required
                  label="name"
                  placeholder="name"
                  {...form.getInputProps("name")}
                />
              </Grid.Col>

              <Grid.Col span={4}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
                  Submit
                </Button>
              </Grid.Col>
            </Grid.Col>

            <Grid.Col span={6}>
              {/* <TextInput
                required
                label="latitude"
                placeholder="latitude"
                {...form.getInputProps("_geo.lat")}
              />
              <TextInput
                required
                label="longitude"
                placeholder="longitude"
                {...form.getInputProps("_geo.lng")}
              /> */}
              <Map setLocation={setLocation} location={location} />
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
};

export default CategoryEditModal;
