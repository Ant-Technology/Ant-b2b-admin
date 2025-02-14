import { useQuery, useMutation } from "@apollo/client";
import {
  Button,
  Checkbox,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { UPDATE_PRODUCT_SKUS } from "apollo/mutuations";
import { GET_PRODUCT_SKU } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const ProductSkuEditModal = ({
  editId,
  setOpenedEdit,
  fetchData,
  activePage,
}) => {
  const form = useForm({});

  const { loading: skuGetLoading } = useQuery(GET_PRODUCT_SKU, {
    variables: {
      id: editId,
    },
    onCompleted(data) {
      form.setValues({
        sku: data.productSku.sku,
        price: data.productSku.price,
        is_active: data.productSku.is_active,
        buy_price: data.productSku.buy_price,
      });
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to fetch SKU data.",
      });
    },
  });

  const [updateProductSku, { loading: skuEditLoading }] = useMutation(UPDATE_PRODUCT_SKUS);

  const { height } = useViewportSize();
  
  const submit = () => {
    updateProductSku({
      variables: {
        id: editId,
        sku: form.values.sku,
        price: parseFloat(form.values.price), // Ensure price is a float
        is_active: form.values.is_active,
        buy_price: parseFloat(form.values.buy_price), // Ensure buy_price is a float
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Product SKU updated successfully.",
        });
        fetchData(activePage);
        setOpenedEdit(false);
      },
      onError(error) {
        showNotification({
          color: "red",
          title: "Error",
          message: "Product SKU not updated successfully.",
        });
      },
    });
  };

  return (
    <>
      <LoadingOverlay
        visible={skuEditLoading || skuGetLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 2.2 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  type="text"
                  label="SKU"
                  placeholder="SKU"
                  {...form.getInputProps("sku")}
                />
                <div style={{ margin: "10px" }}>
                  <Checkbox
                    color="blue"
                    size="lg"
                    checked={form.values.is_active}
                    label="Is active"
                    onChange={(event) => {
                      form.setFieldValue("is_active", event.currentTarget.checked);
                    }}
                  />
                </div>
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  type="number" // Changed to number for appropriate input type
                  label="Price"
                  placeholder="Price"
                  {...form.getInputProps("price")}
                />
                <TextInput
                  required
                  type="number" // Changed to number for appropriate input type
                  placeholder="Buy price"
                  label="Buy price"
                  {...form.getInputProps("buy_price")}
                />
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

export default ProductSkuEditModal;
