import {
  Button,
  Card,
  CircularProgress,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { connect } from "react-redux";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { useEffect, useMemo, useState } from "react";
import SwapSettings from "../../common/SwapSettings";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import {
  allowanceAmount,
  DEFAULT_POOL_TOKENS,
  ETH,
} from "../../../constants/index";
import {
  fromWei,
  getPercentAmountWithFloor,
  getPriceRatio,
  getTokenToSelect,
} from "../../../utils/helper";
import {
  checkLpAllowance,
  confirmLPAllowance,
  getLpBalance,
  removeLiquidityEth,
  loadPairAddress,
  removeLiquidity,
  importToken,
} from "../../../actions/dexActions";
import SelectToken from "../../common/SelectToken";
import BigNumber from "bignumber.js";
import {
  getPairAddress,
  useWalletConnectCallback,
} from "../../../utils/connectionUtils";
import { RESET_POOL_DATA, START_TRANSACTION } from "../../../actions/types";
import store from "../../../store";
import { Settings } from "@material-ui/icons";
import { formatCurrency } from "../../../utils/formatters";
import TransactionConfirm from "../../common/TransactionConfirm";
import { useLocation } from "react-router-dom";
import useActiveWeb3React from "hooks/useActiveWeb3React";
import TokenIcon from "components/common/TokenIcon";
import NumberInput from "components/common/NumberInput";

const useStyles = makeStyles((theme) => ({
  card: {
    width: "96%",
    maxWidth: 500,
    borderRadius: 15,
    boxShadow: `rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px`,
    backgroundColor: theme.palette.primary.bgCard,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 15,
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
      width: "96%",
    },
  },
  cardContents: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardHeading: {
    paddingTop: 5,
    display: "flex",
    width: "95%",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 2,
  },
  cardFeature: {
    paddingLeft: 10,
    width: "95%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingIcon: {
    color: theme.palette.primary.iconColor,
    fontSize: 22,
    cursor: "pointer",
    [theme.breakpoints.down("sm")]: {
      fontSize: 17,
    },
  },
  selectToken: {
    width: 150,
  },
  clearButton: {
    color: theme.palette.textColors.pbr,
    cursor: "pointer",
    fontSize: 16,
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
  inputWrapper: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    width: "95%",

    border: "0.5px solid rgba(224, 224, 224,0.6)",
    borderRadius: 15,
    padding: 7,
  },
  input: {
    backgroundColor: "transparent",
    maxWidth: 240,
    height: 50,
    textAlign: "right",
    borderColor: "transparent",
    fontSize: 50,
    color: theme.palette.textColors.heading,

    outline: "none",
    marginTop: 5,
    marginBlock: 15,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 170,
      height: 45,
      fontSize: 30,
    },
  },
  percentageSymbol: {
    fontSize: 20,
    paddingTop: 20,

    color: theme.palette.textColors.pbr,
    [theme.breakpoints.down("sm")]: {
      fontSize: 17,
      paddingTop: 10,
    },
  },
  percentageBtnGrp: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  percentInputBtn: {
    color: theme.palette.textColors.pbr,

    cursor: "pointer",
    border: "0.1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: "5px 15px 5px 15px",
    marginLeft: 5,
    marginRight: 5,
    "&:hover": {
      background: "rgba(255, 255, 255, 0.1)",
    },
  },
  pairDetail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-between",
    width: "95%",
    border: "0.1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
  },
  tokenIcon: {
    width: "auto",
    height: 20,
    marginRight: 2,
    borderRadius: "50%",
  },
  priceContainer: {
    width: "95%",
    padding: 15,
    color: theme.palette.textColors.light,

    fontSize: 13,
  },
  spinner: {
    color: theme.palette.textColors.pbr,
  },
  heading: {
    color: theme.palette.textColors.heading,
  },
  itemHeading: {
    color: theme.palette.textColors.heading,
    fontSize: 15,
  },
  itemValues: {
    color: theme.palette.textColors.heading,
    fontSize: 15,
  },
  priceValues: {
    color: theme.palette.textColors.subheading,
    fontSize: 14,
    paddingTop: 3,
  },
  iconButton: {
    margin: 0,
    padding: 2,
    backgroundColor: theme.palette.primary.iconBack,
    borderRadius: "30%",
  },
  removeBtn: {
    marginTop: 20,
    backgroundColor: theme.palette.primary.pbr,
    color: "white",
    width: "95%",
    textTransform: "none",
    fontSize: 19,
    borderRadius: 20,
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "12px 50px 12px 50px",
    "&:hover": {
      background: "rgba(224, 7, 125, 0.7)",
    },
    [theme.breakpoints.down("sm")]: {
      marginTop: 5,
      fontSize: 15,
    },
  },
  approveBtn: {
    marginTop: 30,
    backgroundColor: theme.palette.primary.pbr,
    color: theme.palette.primary.buttonText,

    width: "fit-content",
    textTransform: "none",
    fontSize: 17,

    borderRadius: 20,
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "12px 30px 12px 30px",
    "&:hover": {
      background: "rgba(224, 7, 125, 0.7)",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
}));

const RemoveCard = ({
  account: { currentAccount, loading },
  dex: {
    lpApproved,
    lpBalance,
    dexLoading,
    poolReserves,
    poolShare,
    swapSettings,
    pairContractData,
    transaction,
    tokenList,
  },
  handleBack,
  checkLpAllowance,
  confirmLPAllowance,
  getLpBalance,
  removeLiquidityEth,
  loadPairAddress,
  removeLiquidity,
  importToken,
}) => {
  const classes = useStyles();
  const [liquidityPercent, setLiquidityPercent] = useState(0);
  const [liquidityInputTemp, setLiquidityInputTemp] = useState("");
  const [settingOpen, setOpen] = useState(false);
  const [selectedToken0, setToken0] = useState({});
  const [selectedToken1, setToken1] = useState({});

  const [swapDialogOpen, setSwapDialog] = useState(false);
  const query = new URLSearchParams(useLocation().search);

  const { active, chainId } = useActiveWeb3React();
  const [connectWallet] = useWalletConnectCallback();

  const handleSettings = () => {
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

  const [token0Query, token1Query] = [
    query.get("inputCurrency"),
    query.get("outputCurrency"),
  ];

  useEffect(() => {
    async function initSelection() {
      if (token0Query) {
        const _token = getTokenToSelect(tokenList, token0Query);

        if (!_token || !_token.symbol) {
          importToken(token0Query, currentAccount, chainId);
        }
        setToken0(_token);
      } else {
        const _token = getTokenToSelect(
          tokenList,
          DEFAULT_POOL_TOKENS?.[chainId]?.[0]
        );
        setToken0(_token);
      }

      if (token1Query) {
        const _token = getTokenToSelect(tokenList, token1Query);

        if (!_token || !_token.symbol) {
          importToken(token1Query, currentAccount, chainId);
        }

        setToken1(_token);
      } else {
        const _token = getTokenToSelect(
          tokenList,
          DEFAULT_POOL_TOKENS?.[chainId]?.[1]
        );
        setToken1(_token);
      }
    }
    initSelection();
  }, [chainId, currentAccount, tokenList, token0Query, token1Query]);

  const currentLpApproved = useMemo(() => {
    if (
      Object.keys(lpApproved).includes(
        `${selectedToken0.symbol}_${selectedToken1.symbol}`
      )
    ) {
      return lpApproved[`${selectedToken0.symbol}_${selectedToken1.symbol}`];
    } else {
      return lpApproved[`${selectedToken1.symbol}_${selectedToken0.symbol}`];
    }
  }, [lpApproved, selectedToken0, selectedToken1]);

  const handleConfirmAllowance = async () => {
    const _allowanceAmount = allowanceAmount;
    const pairAddress = currentPairAddress;
    await confirmLPAllowance(
      _allowanceAmount,
      selectedToken0,
      selectedToken1,
      pairAddress,
      currentAccount,
      chainId
    );
  };

  const currentLpBalance = useMemo(() => {
    if (
      Object.keys(lpBalance).includes(
        `${selectedToken0.symbol}_${selectedToken1.symbol}`
      )
    ) {
      return lpBalance[`${selectedToken0.symbol}_${selectedToken1.symbol}`];
    } else if (
      Object.keys(lpBalance).includes(
        `${selectedToken1.symbol}_${selectedToken0.symbol}`
      )
    ) {
      return lpBalance[`${selectedToken1.symbol}_${selectedToken0.symbol}`];
    } else {
      return "0";
    }
  }, [lpBalance, selectedToken0, selectedToken1]);

  const currentPairAddress = useMemo(() => {
    if (
      Object.keys(pairContractData).includes(
        `${selectedToken0.symbol}_${selectedToken1.symbol}`
      )
    ) {
      return pairContractData[
        `${selectedToken0.symbol}_${selectedToken1.symbol}`
      ];
    } else if (
      Object.keys(pairContractData).includes(
        `${selectedToken1.symbol}_${selectedToken0.symbol}`
      )
    ) {
      return pairContractData[
        `${selectedToken1.symbol}_${selectedToken0.symbol}`
      ];
    } else {
      return null;
    }
  }, [pairContractData, selectedToken0, selectedToken1]);

  // new use effect
  useEffect(() => {
    async function loadPair() {
      if (selectedToken0.symbol && selectedToken1.symbol) {
        // reset input on token change
        handleClearState();
        store.dispatch({
          type: RESET_POOL_DATA,
        });

        // load erc20 token abi and balance
        // const erc20Token =
        //   selectedToken0.symbol === ETH ? selectedToken1 : selectedToken0;

        let _pairAddress = currentPairAddress;
        if (!_pairAddress) {
          _pairAddress = await getPairAddress(
            selectedToken0.address,
            selectedToken1.address,
            chainId
          );
          loadPairAddress(
            selectedToken0.symbol,
            selectedToken1.symbol,
            _pairAddress,
            chainId
          );
        }

        await getLpBalance(
          selectedToken0,
          selectedToken1,
          _pairAddress,
          currentAccount,
          chainId
        );

        await checkLpAllowance(
          selectedToken0,
          selectedToken1,
          _pairAddress,
          currentAccount,
          chainId
        );
      }
    }

    loadPair();
  }, [selectedToken0, selectedToken1, chainId, currentAccount]);

  const onToken1Select = (token) => {
    setToken0(token);
  };
  const onToken2Select = (token) => {
    setToken1(token);
  };

  const handleClearState = () => {
    handleInputChange("");
  };

  const handleRemoveLiquidity = async () => {
    const lpAmount = getPercentAmountWithFloor(
      currentLpBalance,
      liquidityPercent
    );

    const _lpAmount = lpAmount;

    if (selectedToken0.symbol === ETH || selectedToken1.symbol === ETH) {
      // remove liquidity eth-erc20 || erc20 - eth
      let ethToken, erc20Token;
      if (selectedToken0.symbol === ETH) {
        ethToken = selectedToken0;
        erc20Token = selectedToken1;
      } else {
        ethToken = selectedToken1;
        erc20Token = selectedToken0;
      }

      await removeLiquidityEth(
        ethToken,
        erc20Token,
        currentAccount,
        _lpAmount,
        swapSettings.deadline,
        chainId
      );
    } else {
      // remove liquidy erc20 - erc20

      await removeLiquidity(
        selectedToken0,
        selectedToken1,
        currentAccount,
        _lpAmount,
        swapSettings.deadline,
        chainId
      );
    }

    const pairAddress = currentPairAddress;
    await getLpBalance(
      selectedToken0,
      selectedToken1,
      pairAddress,
      currentAccount,
      chainId
    );
  };

  const handleInputChange = (value) => {
    if (!value) {
      setLiquidityPercent("0");
    } else {
      setLiquidityPercent(value);
    }
    setLiquidityInputTemp(value);
  };

  const priceRatio1 = () => {
    return getPriceRatio(
      fromWei(poolReserves[selectedToken1.symbol], selectedToken1.decimals),
      fromWei(poolReserves[selectedToken0.symbol], selectedToken0.decimals)
    );
  };

  const priceRatio2 = () => {
    return getPriceRatio(
      fromWei(poolReserves[selectedToken0.symbol], selectedToken0.decimals),
      fromWei(poolReserves[selectedToken1.symbol], selectedToken1.decimals)
    );
  };

  // liquidity transaction status updates
  useEffect(() => {
    if (!transaction.hash && !transaction.type) {
      return;
    }

    if (
      ["remove", "lp_token_approve"].includes(transaction.type) &&
      transaction.status === "pending"
    ) {
      setSwapDialog(true);
    }

    if (
      ["remove", "lp_token_approve"].includes(transaction.type) &&
      (transaction.status === "success" || transaction.status === "failed")
    ) {
      setSwapDialog(true);
    }
  }, [transaction]);

  const handleConfirmSwapClose = (value) => {
    setSwapDialog(value);
    if (
      ["remove", "lp_token_approve"].includes(transaction.type) &&
      transaction.status === "success"
    ) {
      store.dispatch({ type: START_TRANSACTION });
      // handleClearState();
    } else if (
      ["remove", "lp_token_approve"].includes(transaction.type) &&
      transaction.status === "failed"
    ) {
      store.dispatch({ type: START_TRANSACTION });
    }
  };

  const currentPairDecimals = (token1, token2) => {
    return (parseInt(token1.decimals) + parseInt(token2.decimals)) / 2;
  };

  const disableStatus = useMemo(() => {
    if (!active) {
      return false;
    }

    return (
      loading ||
      new BigNumber(currentLpBalance).eq(0) ||
      new BigNumber(liquidityPercent).eq(0)
    );
  }, [active, loading, liquidityPercent, currentLpBalance]);

  const currentButton = useMemo(() => {
    if (!active) {
      return "Connect Wallet";
    }

    if (loading) {
      return "Please wait...";
    } else if (new BigNumber(currentLpBalance).eq(0)) {
      return "No liquidity to remove";
    } else if (
      ["remove", "lp_token_approve"].includes(transaction.type) &&
      transaction.status === "pending"
    ) {
      return "Pending Transaction...";
    } else {
      return !currentLpApproved ? "Approve LP token" : "Remove Liquidity";
    }
  }, [active, loading, transaction, currentLpApproved, currentLpBalance]);

  const handleAction = () => {
    if (!active) {
      connectWallet();
      return;
    }

    if (dexLoading) {
      setSwapDialog(true);
      return;
    }

    if (!currentLpApproved) {
      setSwapDialog(true);
      handleConfirmAllowance();
    } else {
      setSwapDialog(true);
      handleRemoveLiquidity();
    }
  };

  return (
    <>
      <SwapSettings open={settingOpen} handleClose={close} />
      <TransactionConfirm
        open={swapDialogOpen}
        handleClose={() => handleConfirmSwapClose(false)}
        selectedToken0={selectedToken0}
        selectedToken1={selectedToken1}
        token1Value={0}
        token2Value={0}
        priceImpact={0}
      />
      <Card elevation={20} className={classes.card}>
        <div className={classes.cardContents}>
          <div className={classes.cardHeading}>
            <IconButton onClick={handleBack} style={{ margin: 0, padding: 0 }}>
              <KeyboardBackspaceIcon
                fontSize="default"
                className={classes.settingIcon}
              />
            </IconButton>
            <h6 className={classes.heading}>Remove Liquidity</h6>
            <IconButton
              onClick={handleSettings}
              style={{ margin: 0, padding: 0 }}
              className={classes.iconButton}
            >
              <Settings fontSize="default" className={classes.settingIcon} />
            </IconButton>
          </div>

          <div className={classes.inputWrapper}>
            <div className={classes.cardFeature}>
              <div className={classes.heading}>Amount</div>
              <div className={classes.clearButton} onClick={handleClearState}>
                Clear
              </div>
            </div>

            <div className="d-flex justify-content-center align-items-center">
              <div>
                <NumberInput
                  onInputChange={handleInputChange}
                  value={liquidityInputTemp}
                  style={classes.input}
                />
              </div>
              <div className={classes.percentageSymbol}>%</div>
            </div>

            <div className={classes.percentageBtnGrp}>
              <span
                className={classes.percentInputBtn}
                onClick={() => handleInputChange("25")}
              >
                25%
              </span>
              <span
                className={classes.percentInputBtn}
                onClick={() => handleInputChange("50")}
              >
                50%
              </span>
              <span
                className={classes.percentInputBtn}
                onClick={() => handleInputChange("75")}
              >
                75%
              </span>
              <span
                className={classes.percentInputBtn}
                onClick={() => handleInputChange("100")}
              >
                Max
              </span>
            </div>
          </div>

          <div className="mt-2 mb-2">
            <ArrowDownwardIcon style={{ color: "#bdbdbd" }} />
          </div>

          <div className={classes.pairDetail}>
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <SelectToken
                  selectedToken={selectedToken0}
                  disableToken={selectedToken1}
                  handleTokenSelected={onToken1Select}
                />
              </div>
              <div className="d-flex">
                <SelectToken
                  selectedToken={selectedToken1}
                  disableToken={selectedToken0}
                  handleTokenSelected={onToken2Select}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mb-1"></div>
          </div>

          <div className={classes.priceContainer}>
            {loading ? (
              <div className="d-flex justify-content-center">
                <CircularProgress className={classes.spinner} size={30} />
              </div>
            ) : new BigNumber(priceRatio1()).eq(0) && !active ? (
              <div className="d-flex justify-content-center">
                <span>
                  {active
                    ? "No liquidity available for selected pool"
                    : "Connect your wallet first"}
                </span>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between">
                  <span className={classes.heading}>Price:</span>
                  <span className={classes.priceValues}>
                    1 {selectedToken0.symbol} = {priceRatio1()}
                    {selectedToken1.symbol}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span></span>
                  <span className={classes.priceValues}>
                    {" "}
                    1 {selectedToken1.symbol} = {priceRatio2()}
                    {selectedToken0.symbol}
                  </span>
                </div>
              </>
            )}
          </div>
          <div style={{ color: "#DF097C", fontSize: 13 }}>
            {dexLoading ||
              !currentLpApproved ||
              new BigNumber(currentLpBalance).eq(0) ||
              (new BigNumber(liquidityPercent).eq(0) &&
                "* Choose your amount of first to remove liquidity.")}
          </div>

          <Button
            disabled={disableStatus}
            onClick={handleAction}
            className={classes.removeBtn}
          >
            {currentButton}
          </Button>
        </div>
      </Card>

      <Card
        elevation={20}
        className={classes.card}
        style={{ marginTop: 30, marginBottom: 30 }}
      >
        <div className={classes.priceContainer}>
          {false ? (
            <div className="d-flex justify-content-center pt-2 pb-2">
              <CircularProgress className={classes.spinner} size={30} />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-center">
                <div className={classes.heading} style={{ fontSize: 20 }}>
                  Your Position
                </div>
              </div>

              <div className="d-flex justify-content-between my-2 align-items-center">
                <div className="d-flex justify-content-between align-items-center">
                  <TokenIcon address={selectedToken0?.address} />
                  <TokenIcon address={selectedToken1?.address} />
                  <span
                    className={classes.itemHeading}
                    style={{ paddingTop: 5 }}
                  >
                    {selectedToken0.symbol}/{selectedToken1.symbol}{" "}
                    {`( LP tokens )`}
                  </span>
                </div>
                <span className={classes.itemValues}>
                  {formatCurrency(
                    fromWei(
                      currentLpBalance,
                      currentPairDecimals(selectedToken0, selectedToken1)
                    )
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between mt-3 mb-3">
                <div className={classes.itemHeading}>Your pool share:</div>
                <div className={classes.itemValues}>{poolShare}%</div>
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
};

const mapStateToProps = (state) => ({
  account: state.account,
  dex: state.dex,
});

export default connect(mapStateToProps, {
  checkLpAllowance,
  confirmLPAllowance,
  getLpBalance,
  removeLiquidityEth,
  loadPairAddress,
  removeLiquidity,
  importToken,
})(RemoveCard);
