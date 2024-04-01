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
      });
    },
    onError(data) {},
  });

  const [updateProductSku, { loading: skuEditLoading }] =
    useMutation(UPDATE_PRODUCT_SKUS);

  const { height } = useViewportSize();
  const submit = () => {
    updateProductSku({
      variables: {
        id: editId,
        sku: form.values.sku,
        price: parseInt(form.values.price),
        is_active: form.values.is_active,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "ProductSKU updated Successfully",
        });
        fetchData(activePage);
        setOpenedEdit(false);
      },
      onError(data) {
        showNotification({
          color: "red",
          title: "Error",
          message: "ProductSKU not updated Successfully",
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
              <Grid.Col span={4}></Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  required
                  type="text"
                  label="Sku"
                  placeholder="Sku"
                  {...form.getInputProps("sku")}
                />
                <TextInput
                  required
                  type="text"
                  label="Price"
                  placeholder="Price"
                  {...form.getInputProps("price")}
                />
                <div style={{ margin: "10px" }}>
                  <Checkbox
                    color="blue"
                    size="lg"
                    checked={form.values.is_active}
                    label="Is active"
                    onChange={(event) => {
                      form.setFieldValue(
                        "is_active",
                        event.currentTarget.checked
                      );
                    }}
                  />
                </div>
                <Button type="submit" color="blue" variant="outline" fullWidth>
                  Submit
                </Button>
              </Grid.Col>
              <Grid.Col span={4}></Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </>
  );
};

export default ProductSkuEditModal;
