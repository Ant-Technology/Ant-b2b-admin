import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import Map from "components/utilities/Map";
import { customLoader } from "components/utilities/loader";
import { CREATE_WARE_HOUSE } from "../../apollo/mutuations";
import { GET_WARE_HOUSES } from "../../apollo/queries";

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
        input: {
          name: form.getInputProps("name").value,
          _geo: {
            lat: +location.lat,
            lng: +location.lng,
          },
        },
      },
      onCompleted(data) {
        // setActivePage(1);
        showNotification({
          color: "green",
          title: "Success",
          message: "Category Created Successfully",
        });
        // refetch();
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
              <Map setLocation={setLocation} />
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
}
