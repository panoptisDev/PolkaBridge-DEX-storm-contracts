import { makeStyles } from "@material-ui/core";
import { connect } from "react-redux";
import TuneIcon from "@material-ui/icons/Tune";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { useEffect, useState } from "react";
import SwapSettings from "../../common/SwapSettings";
import etherImg from "../../../assets/ether.png";
import bnbImg from "../../../assets/binance.png";
import CustomButton from "../../Buttons/CustomButton";
import SwapCardItem from "../../Cards/SwapCardItem";
import AddIcon from "@material-ui/icons/Add";
import { etheriumNetwork } from "../../../constants";

const useStyles = makeStyles((theme) => ({
  card: {
    width: 450,
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
      width: "100%",
    },
  },
  cardContents: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 15,
  },
  avatar: {
    zIndex: 2,
    position: "relative",
    width: "auto",
    height: 60,
  },
  avatar_corgib: {
    zIndex: 2,
    width: "auto",
    height: 160,
  },
  cardHeading: {
    display: "flex",
    width: "95%",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 2,
  },
  cardSubHeading: {
    display: "flex",
    width: "95%",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
    marginBottom: 2,
  },
  settingIcon: {
    color: "#f6f6f6",
    cursor: "pointer",
  },
  numbers: {
    color: "#E0077D",
    fontSize: 26,
  },
  tokenPair: {
    display: "flex",
    width: "94%",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 15,
  },
  selectToken: {
    width: 150,
  },
  checkIcon: {
    color: "#E0077D",
  },
  selectPoolContainer: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  feeSelectContainer: {
    width: 140,
    padding: 6,
    marginLeft: 5,
    marginRight: 5,
    border: "0.5px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    "&:hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
    [theme.breakpoints.down("sm")]: {
      width: 100,
      padding: 2,
      marginLeft: 2,
      marginRight: 2,
    },
  },
  feeSelectHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  priceRangeCardContainer: {
    display: "flex",
    width: "90%",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 15,
  },
  feeSelectHeadingP: {
    fontSize: 14,
  },
  feeSelectHeadingSpan: {
    fontSize: 12,
  },
  addButton: {
    height: 45,
    width: "90%",
    marginTop: 30,
    marginBottom: 5,
  },
  clearButton: {
    color: "#E0077D",
    cursor: "pointer",
  },
}));

const AddCard = ({
  account: { balance, loading, currentNetwork },
  tokenType,
  handleBack,
}) => {
  const currentDefaultToken = {
    icon: etherImg,
    name: "Ethereum",
    symbol: "ETH",
  };
  const classes = useStyles();
  const [settingOpen, setOpen] = useState(false);
  const [selectedToken1, setToken1] = useState(currentDefaultToken);
  const [selectedToken2, setToken2] = useState({});
  const [token1Value, setToken1Value] = useState("");
  const [token2Value, setToken2Value] = useState("");

  const [token1PerToken2, setPerToken1] = useState("1.4545");
  const [token2PerToken1, setPerToken2] = useState("0.66891");
  const [shareOfPool, setShare] = useState("0.04");

  const [addStatus, setStatus] = useState({
    message: "Please select tokens",
    disabled: true,
  });

  const handleSettings = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (currentNetwork === etheriumNetwork) {
      setToken1({
        icon: etherImg,
        name: "Ethereum",
        symbol: "ETH",
      });
    } else {
      setToken1({
        icon: bnbImg,
        name: "Binance",
        symbol: "BNB",
      });
    }
  }, [currentNetwork]);

  const verifySwapStatus = (token1, token2) => {
    if (token1.selected.symbol === token2.selected.symbol) {
      setStatus({ message: "Invalid pair", disabled: true });
    } else if (
      (!token1.value && token1.selected.symbol) ||
      (!token2.value && token2.selected.symbol)
    ) {
      setStatus({ message: "Enter amounts", disabled: true });
    } else if (!token1.selected.symbol || !token2.selected.symbol) {
      setStatus({ message: "Select both tokens", disabled: true });
    } else if (
      token1.value > 0 &&
      token2.value > 0 &&
      token1.selected.symbol &&
      token2.selected.symbol
    ) {
      setStatus({ message: "Add liquidity", disabled: false });
    }
  };

  const onToken1InputChange = (tokens) => {
    setToken1Value(tokens);

    verifySwapStatus(
      { value: tokens, selected: selectedToken1 },
      { value: token2Value, selected: selectedToken2 }
    );
  };

  const onToken2InputChange = (tokens) => {
    setToken2Value(tokens);

    verifySwapStatus(
      { value: token1Value, selected: selectedToken1 },
      { value: tokens, selected: selectedToken2 }
    );
  };

  const onToken1Select = (token) => {
    setToken1(token);

    verifySwapStatus(
      { value: token1Value, selected: token },
      { value: token2Value, selected: selectedToken2 }
    );
  };
  const onToken2Select = (token) => {
    setToken2(token);
    verifySwapStatus(
      { value: token1Value, selected: selectedToken1 },
      { value: token2Value, selected: token }
    );
  };

  const handleClearState = () => {
    setToken1Value("");
    setToken2Value("");
    setToken1(currentDefaultToken);
    setToken2({});
  };

  return (
    <>
      <SwapSettings open={settingOpen} handleClose={close} />
      <div className={classes.card}>
        <div className="card-theme">
          <div className={classes.cardContents}>
            <div className={classes.cardHeading}>
              <KeyboardBackspaceIcon
                fontSize="default"
                onClick={handleBack}
                className={classes.settingIcon}
              />
              <p>Add Liquidity</p>
              <TuneIcon
                fontSize="default"
                onClick={handleSettings}
                className={classes.settingIcon}
              />
            </div>

            <div className={classes.cardHeading}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Select pair
              </span>
              <a className={classes.clearButton} onClick={handleClearState}>
                Clear all
              </a>
            </div>

            <SwapCardItem
              onInputChange={onToken1InputChange}
              onTokenChange={onToken1Select}
              currentToken={selectedToken1}
              inputValue={token1Value}
            />
            <AddIcon fontSize="default" className={classes.settingIcon} />
            <SwapCardItem
              onInputChange={onToken2InputChange}
              onTokenChange={onToken2Select}
              currentToken={selectedToken2}
              inputValue={token2Value}
            />

            {selectedToken1.symbol && selectedToken2.symbol ? (
              <>
                <div className={classes.cardSubHeading}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255, 255, 255, 0.7)",
                      marginTop: 20,
                    }}
                  >
                    Prices and Pool share
                  </span>
                </div>

                <div className={classes.selectPoolContainer}>
                  <div className={classes.feeSelectContainer}>
                    <div className={classes.feeSelectHeading}>
                      <p className={classes.feeSelectHeadingP}>
                        {token1PerToken2}
                      </p>
                    </div>
                    <span className={classes.feeSelectHeadingSpan}>
                      {`${selectedToken1.symbol} per ${selectedToken2.symbol}`}
                    </span>
                  </div>

                  <div className={classes.feeSelectContainer}>
                    <div className={classes.feeSelectHeading}>
                      <p className={classes.feeSelectHeadingP}>
                        {token2PerToken1}
                      </p>
                    </div>
                    <span className={classes.feeSelectHeadingSpan}>
                      {`${selectedToken2.symbol} per ${selectedToken1.symbol}`}
                    </span>
                  </div>

                  <div className={classes.feeSelectContainer}>
                    <div className={classes.feeSelectHeading}>
                      <p
                        className={classes.feeSelectHeadingP}
                      >{`${shareOfPool}%`}</p>
                    </div>
                    <span className={classes.feeSelectHeadingSpan}>
                      Share of pool
                    </span>
                  </div>
                </div>
              </>
            ) : (
              ""
            )}

            <CustomButton
              variant="light"
              className={classes.addButton}
              disabled={addStatus.disabled}
            >
              {addStatus.message}
            </CustomButton>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  account: state.account,
});

export default connect(mapStateToProps, {})(AddCard);