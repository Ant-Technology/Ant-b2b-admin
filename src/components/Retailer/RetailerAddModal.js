import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import Map from "components/utilities/Map";
import { CREATE_RETAILER } from "apollo/mutuations";
import { GET_REGIONS, GET_RETAILERS } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const RetailerAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // state variables
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);
  // state variable to handle map location
  const [location, setLocation] = useState({});
  // form state
  const form = useForm({
    initialValues: {
      name: "",
      _geo: "",
      address: "",
      city: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      region: {
        connect: "1",
      },
      user: {
        create: {
          name: "fafa",
          email: "test@mail.com",
          password: "fafa",
          password_confirmation: "fafa",
          role: {
            connect: "3"
          }
        },
      },
    },
  });

  // mutation
  const [addRetailer, { loading: retailerLoading }] = useMutation(
    CREATE_RETAILER,
    {
      update(cache, { data: { createRetailer } }) {
        cache.updateQuery(
          {
            query: GET_RETAILERS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.retailers.data.length === 10) {
              setTotal(total + 1);
              setActivePage(total + 1);
            } else {
              return {
                retailers: {
                  data: [createRetailer, ...data.retailers.data],
                },
              };
            }
          }
        );
      },
    }
  );

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

  useEffect(() => {}, []);

  const { height } = useViewportSize();

  const submit = () => {
    addRetailer({
      variables: {
        name: form.getInputProps("name").value,
        _geo: {
          lat: +location.lat,
          lng: +location.lng,
        },
        contact_name: form.getInputProps("contact_name").value,
        contact_phone: form.getInputProps("contact_phone").value,
        contact_email: form.getInputProps("contact_email").value,
        city: form.getInputProps("city").value,
        region: form.getInputProps("region").value,
        address: form.getInputProps("address").value,
        user: form.getInputProps("user").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Retailer Created Successfully",
        });

        setOpened(false);
      },
      onError(error) {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Retailer Not Created Successfully",
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("region.connect", val);
  };

  return (
    <>
      <LoadingOverlay
        visible={regionsLoading || retailerLoading}
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
                <Select
                  data={regionsDropDownData}
                  value={form.getInputProps("region.connect")?.value.toString()}
                  onChange={setRegionDropDownValue}
                  label="Region"
                  placeholder="Pick a region this retailer belongs to"
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
                  label="Contact Email"
                  placeholder="Email"
                  {...form.getInputProps("contact_email")}
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
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="User Name"
                  placeholder="User Name"
                  {...form.getInputProps("user.create.name")}
                />
                <TextInput
                  required
                  label="Email"
                  placeholder="Email"
                  {...form.getInputProps("user.create.email")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  // description="Password must include at least one letter, number and special character"
                  {...form.getInputProps("user.create.password")}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  // description="Password must the samer"
                  {...form.getInputProps("user.create.password_confirmation")}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={12}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map setLocation={setLocation} />
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

export default RetailerAddModal;
