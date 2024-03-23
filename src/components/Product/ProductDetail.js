import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  Modal,
  LoadingOverlay,
  Grid,
  Stack,
  Select,
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Image,
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_PRODUCT, GET_SHIPMENTS } from "apollo/queries";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

function ProductDetailModal({ Id }) {
  // state variables
  const { classes } = useStyles();
  const [product, setProduct] = useState();

  const { loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { id: Id },
    onCompleted(data) {
      let order = data.product;
      setProduct(order);
    },
  });
  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
    <div style={{ width: "98%", margin: "auto" }}>
      <LoadingOverlay
        visible={productLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
        <div style={{ paddingLeft: "20px" }}>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text size="sm" weight={500} className={classes.diff}>
              <span>
                Product Name<span style={{ marginLeft: "5px" }}>:</span>
              </span>
            </Text>
            <Text className={classes.value}>{product?.name}</Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text size="sm" weight={500} className={classes.diff}>
              <span>
                Category<span style={{ marginLeft: "5px" }}>:</span>
              </span>
            </Text>
            <Text className={classes.value}>{product?.category?.name}</Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text size="sm" weight={500} className={classes.diff}>
              <span>
                Description<span style={{ marginLeft: "5px" }}>:</span>
              </span>
            </Text>
            <Text className={classes.value}>{product?.description}</Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text size="sm" weight={500} className={classes.diff}>
              <span>
                Order Count<span style={{ marginLeft: "5px" }}>:</span>
              </span>
            </Text>
            <Text className={classes.value}>{product?.orderCount}</Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={25}>
            <Text size="sm" weight={500} className={classes.diff}>
              <span>
              Product Skus <span style={{ marginLeft: "5px" }}>:</span>
              </span>
            </Text>
            <Text className={classes.value}>{product?.skus.length}</Text>
          </Group>
        </div>
      </Card>
      <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
      <ScrollArea>
      <Text size="md" weight={500} className={classes.diff}>
              <span>
               Product Variants
              </span>
            </Text>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 600 }}
            >
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock Count</th>
                </tr>
              </thead>
              <tbody>
                {product?.skus?.map((sku) => (
                  <tr key={sku.id}>
                    <td>{sku.sku}</td>
                    <td>{sku.price}</td>
                    <td>{sku.stockCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>

         
      </Card>
    </div>
    </ScrollArea>
  );
}

export default ProductDetailModal;
